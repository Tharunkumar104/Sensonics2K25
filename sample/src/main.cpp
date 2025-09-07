#define TINY_GSM_MODEM_SIM900

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Firebase_ESP_Client.h>
#include <TinyGsmClient.h>
#include <ArduinoJson.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// --- Forward Declarations ---

void sendEmergencySMS(bool immediate);

// --- WiFi & Firebase Config ---
#define WIFI_SSID "Tharunkumar"
#define WIFI_PASSWORD "Tharun104"
#define API_KEY "AIzaSyBtHa3pohRLotKSeC16o78zGPZxU-VZcRE"
#define DATABASE_URL "https://accident-prevention-a1b08-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_PROJECT_ID "accident-prevention-a1b08"
#define USER_EMAIL "tharunkumar10406@gmail.com"
#define USER_PASSWORD "Tharun@104"

// GPIO Pins
const int PIN_ACCIDENT = 4;
const int PIN_CANCEL = 5;
const int PIN_IMMEDIATE = 18;
const int PIN_LED = 2;

// SIM900A serial pins
#define MODEM_RX 16
#define MODEM_TX 17

#define WAIT_TIME 300000UL
#define DEBOUNCE 50

FirebaseData fbdo;
FirebaseData fbdo2;
FirebaseAuth auth;
FirebaseConfig config;
TinyGsm modem(Serial2);

String deviceId;
String userUID;
String emergencyNumber;
String userName;
String bloodGroup;
String medicalIssues;
String homeAddress;
bool userDataFetched = false;
bool accidentFlag = false;
unsigned long accidentMillis = 0;

String repeatChar(char c, int count)
{
  String s = "";
  for (int i = 0; i < count; i++)
    s += c;
  return s;
}

void blinkLED(int times, int delayMs = 200)
{
  for (int i = 0; i < times; i++)
  {
    digitalWrite(PIN_LED, HIGH);
    delay(delayMs);
    digitalWrite(PIN_LED, LOW);
    delay(delayMs);
  }
}

// Helper to wait for '>' prompt after AT+CMGS command
bool waitForPrompt(Stream &stream, uint32_t timeout = 5000)
{
  uint32_t start = millis();
  while (millis() - start < timeout)
  {
    if (stream.available())
    {
      String resp = stream.readString();
      if (resp.indexOf('>') != -1)
        return true;
    }
    delay(100);
  }
  return false;
}

bool sendSMS(const String &number, const String &message)
{
  Serial.println("=== SENDING SMS ===");
  Serial.println("To: " + number);
  Serial.println("Message: " + message);
  Serial.println("==================");

  String num = number;
  num.trim();
  if (num.startsWith("+"))
  {
    num = num.substring(1);
  }
  if (num.length() < 10)
  {
    Serial.println("[GSM] Invalid emergency number!");
    return false;
  }

  if (!modem.testAT())
  {
    Serial.println("[GSM] Modem not responding, restarting...");
    modem.restart();
    delay(3000);
  }
  if (!modem.waitForNetwork(30000))
  {
    Serial.println("[GSM] Network registration failed");
    return false;
  }

  Serial.println("[GSM] Sending SMS...");
  blinkLED(3, 100);

  modem.stream.println("AT+CMGF=1"); // Set SMS text mode
  delay(1000);
  while (modem.stream.available())
    Serial.write(modem.stream.read());

  modem.stream.print("AT+CMGS=\"");
  modem.stream.print(number);
  modem.stream.println("\"");

  if (!waitForPrompt(modem.stream, 5000))
  {
    Serial.println("[GSM] Failed to get prompt '>'");
    return false;
  }

  modem.stream.print(message);
  modem.stream.flush();
  delay(100);
  modem.stream.write(26); // Ctrl+Z to send
  modem.stream.flush();

  Serial.println("[GSM] Sent Ctrl+Z, waiting for response...");

  uint32_t start = millis();
  String finalResponse = "";
  while (millis() - start < 10000)
  {
    while (modem.stream.available())
    {
      char c = modem.stream.read();
      Serial.write(c);
      finalResponse += c;
    }
    if (finalResponse.indexOf("OK") != -1 || finalResponse.indexOf("ERROR") != -1)
    {
      break;
    }
    delay(100);
  }
  Serial.println();

  if (finalResponse.indexOf("OK") != -1)
  {
    Serial.println("[GSM] ✅ SMS Sent Successfully!");
    blinkLED(5, 100);
    return true;
  }
  else
  {
    Serial.println("[GSM] ❌ SMS Send Failed with response:");
    Serial.println(finalResponse);
    blinkLED(10, 50);
    return false;
  }
}

bool fetchUserDetails()
{
  Serial.println("=== FETCHING USER DETAILS FROM FIRESTORE ===");
  String documentPath = "users/" + userUID;
  Serial.println("Document Path: " + documentPath);

  if (Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str()))
  {
    Serial.println("✅ Firestore document retrieved successfully!");
    FirebaseJson payload;
    payload.setJsonData(fbdo.payload().c_str());
    FirebaseJsonData jsonData;

    if (payload.get(jsonData, "fields/emergencyContact/stringValue"))
      emergencyNumber = jsonData.stringValue;
    else
      emergencyNumber = "";

    if (payload.get(jsonData, "fields/name/stringValue"))
      userName = jsonData.stringValue;
    else
      userName = "Unknown";

    if (payload.get(jsonData, "fields/bloodGroup/stringValue"))
      bloodGroup = jsonData.stringValue;
    else
      bloodGroup = "Unknown";

    if (payload.get(jsonData, "fields/medicalIssues/stringValue"))
      medicalIssues = jsonData.stringValue;
    else
      medicalIssues = "None";

    if (payload.get(jsonData, "fields/homeAddress/stringValue"))
      homeAddress = jsonData.stringValue;
    else
      homeAddress = "Not provided";

    if (emergencyNumber.length() > 0)
    {
      userDataFetched = true;
      Serial.println("✅ User data fetching SUCCESSFUL!");
      return true;
    }
    else
    {
      Serial.println("❌ Emergency contact is required but not found!");
      return false;
    }
  }
  else
  {
    Serial.printf("❌ Failed to get user details from Firestore: %s\n", fbdo.errorReason().c_str());
    return false;
  }
}

bool fetchCurrentLocation(float &lat, float &lng)
{
  Serial.println("=== FETCHING CURRENT LOCATION FROM RTDB ===");
  String path = "/locations/" + userUID + "/current";
  Serial.println("RTDB Path: " + path);

  if (Firebase.RTDB.getJSON(&fbdo2, path.c_str()))
  {
    Serial.println("✅ Location data retrieved from RTDB");
    FirebaseJsonData jsonLat, jsonLng;
    if (fbdo2.jsonObject().get(jsonLat, "latitude") && fbdo2.jsonObject().get(jsonLng, "longitude"))
    {
      lat = jsonLat.floatValue;
      lng = jsonLng.floatValue;
      Serial.printf("📍 Location: %.6f, %.6f\n", lat, lng);
      return true;
    }
    else
    {
      Serial.println("❌ Latitude/Longitude not found in location data");
      return false;
    }
  }
  else
  {
    Serial.printf("❌ Failed to get location from RTDB: %s\n", fbdo2.errorReason().c_str());
    return false;
  }
}

void setupWiFi()
{
  Serial.println("=== CONNECTING TO WIFI ===");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to: " + String(WIFI_SSID));
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30)
  {
    Serial.print(".");
    blinkLED(1, 100);
    delay(500);
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\n✅ WiFi Connected!");
    Serial.println("📶 IP Address: " + WiFi.localIP().toString());
    Serial.println("📱 MAC Address: " + WiFi.macAddress());
    deviceId = WiFi.macAddress();
    blinkLED(3, 100);
  }
  else
  {
    Serial.println("\n❌ WiFi Connection Failed!");
    blinkLED(10, 200);
  }
}

void setupFirebase()
{
  Serial.println("=== CONNECTING TO FIREBASE ===");
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  Serial.print("Authenticating with Firebase");
  int attempts = 0;
  while (!Firebase.ready() && attempts < 20)
  {
    Serial.print(".");
    delay(500);
    attempts++;
  }
  if (Firebase.ready())
  {
    userUID = auth.token.uid.c_str();
    Serial.println("\n✅ Firebase Connected!");
    blinkLED(2, 100);
  }
  else
  {
    Serial.println("\n❌ Firebase Connection Failed!");
    blinkLED(5, 200);
  }
}

void setupSIM900()
{
  Serial.println("=== INITIALIZING SIM900A MODULE ===");
  Serial2.begin(9600, SERIAL_8N1, MODEM_RX, MODEM_TX);
  delay(1000);
  Serial.println("🔄 Restarting modem...");
  modem.restart();
  delay(5000);
  Serial.print("📡 Checking modem response");
  int attempts = 0;
  while (!modem.testAT() && attempts < 10)
  {
    Serial.print(".");
    delay(1000);
    attempts++;
  }
  if (modem.testAT())
  {
    Serial.println("\n✅ SIM900A Modem OK!");
    String modemInfo = modem.getModemInfo();
    Serial.println("📋 Modem Info: " + modemInfo);
    if (modem.getSimStatus() == 1)
    {
      Serial.println("📱 SIM Card OK");
      Serial.print("📶 Waiting for network");
      while (!modem.waitForNetwork(30000))
      {
        Serial.print(".");
        delay(1000);
      }
      Serial.println("\n🌐 Network Connected!");
      String operator_name = modem.getOperator();
      Serial.println("📡 Operator: " + operator_name);
      int signal = modem.getSignalQuality();
      Serial.println("📶 Signal Strength: " + String(signal));
    }
    else
    {
      Serial.println("❌ SIM Card not detected!");
    }
  }
  else
  {
    Serial.println("\n❌ SIM900A Modem not responding!");
  }
  blinkLED(3, 200);
}

void sendEmergencySMS(bool immediate)
{
  Serial.println("\n🚨 EMERGENCY SMS TRIGGERED 🚨");

  if (!userDataFetched)
  {
    Serial.println("⚠️  User data not available, fetching now...");
    if (!fetchUserDetails())
    {
      Serial.println("❌ Cannot send SMS without user data!");
      return;
    }
  }

  float lat = 0, lng = 0;
  bool locationFound = fetchCurrentLocation(lat, lng);

  // First message: user name, location coordinates, Google Maps URL
  String message1 = "";
  message1 += userName + "\n";
  if (locationFound)
  {
    message1 += String(lat, 6) + "," + String(lng, 6) + "\n";
    message1 += "https://maps.google.com/?q=" + String(lat, 6) + "," + String(lng, 6);
  }
  else
  {
    message1 += "Location not available";
  }

  // Second message: user name, emergency number, blood group, address, medical history
  String message2 = "";
  message2 += userName + "\n";
  message2 += emergencyNumber + "\n";
  message2 += bloodGroup + "\n";
  message2 += homeAddress + "\n";

  if (medicalIssues.length() > 0 && medicalIssues != "None")
  {
    message2 += medicalIssues;
  }
  else
  {
    message2 += "No medical history";
  }

  Serial.println("📱 Sending FIRST SMS to: " + emergencyNumber);
  bool sent1 = sendSMS(emergencyNumber, message1);
  delay(7000); // Wait between messages for modem readiness

  Serial.println("📱 Sending SECOND SMS to: " + emergencyNumber);
  bool sent2 = sendSMS(emergencyNumber, message2);

  if (sent1 && sent2)
  {
    Serial.println("✅ Both emergency SMS messages sent successfully!");

    String alertPath = "/alerts/" + String(millis());
    FirebaseJson alertLog;
    alertLog.set("userUID", userUID);
    alertLog.set("deviceId", deviceId);
    alertLog.set("timestamp", millis());
    alertLog.set("type", immediate ? "immediate" : "timeout");
    alertLog.set("smsSent", true);
    alertLog.set("emergencyContact", emergencyNumber);
    if (locationFound)
    {
      alertLog.set("latitude", lat);
      alertLog.set("longitude", lng);
    }
    Firebase.RTDB.setJSON(&fbdo, alertPath.c_str(), &alertLog);
  }
  else
  {
    Serial.println("❌ Failed to send one or both emergency SMS messages!");
    blinkLED(20, 100);
  }
}

bool debounce(int pin, bool &lastState, unsigned long &lastMs)
{
  bool state = digitalRead(pin);
  if (state != lastState && millis() - lastMs > DEBOUNCE)
  {
    lastMs = millis();
    lastState = state;
    return !state;
  }
  return false;
}

void setup()
{
  Serial.begin(115200);
  delay(2000);
  Serial.println("\n" + repeatChar('=', 50));
  Serial.println("🚨 ESP32 ACCIDENT DETECTION SYSTEM 🚨");
  Serial.println("Version: 2.0 with SIM900A SMS");
  Serial.println(repeatChar('=', 50));
  pinMode(PIN_ACCIDENT, INPUT_PULLUP);
  pinMode(PIN_CANCEL, INPUT_PULLUP);
  pinMode(PIN_IMMEDIATE, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
  blinkLED(5, 200);
  setupWiFi();
  if (WiFi.status() == WL_CONNECTED)
  {
    setupFirebase();
    if (Firebase.ready())
      fetchUserDetails();
  }
  setupSIM900();
  Serial.println("\n✅ System Ready! Monitoring for emergencies...");
  Serial.println("🔴 Press ACCIDENT button (GPIO4) to start 5-min countdown");
  Serial.println("🟡 Press CANCEL button (GPIO5) to cancel accident alert");
  Serial.println("🔴 Press IMMEDIATE button (GPIO18) for instant emergency SMS");
  Serial.println(repeatChar('=', 50) + "\n");
  blinkLED(3, 100);
}

void loop()
{
  static bool lastAccident = HIGH, lastCancel = HIGH, lastImmediate = HIGH;
  static unsigned long msAccident = 0, msCancel = 0, msImmediate = 0;
  static unsigned long lastPrint = 0;

  if (debounce(PIN_ACCIDENT, lastAccident, msAccident))
  {
    if (!accidentFlag)
    {
      accidentFlag = true;
      accidentMillis = millis();
      Serial.println("\n🚨 [ACCIDENT DETECTED] Starting 5-minute countdown...");
      Serial.println("⏰ Press CANCEL button to abort, or wait 5 minutes for auto-SMS");
      blinkLED(5, 200);
      fetchUserDetails();
    }
  }
  if (debounce(PIN_CANCEL, lastCancel, msCancel))
  {
    if (accidentFlag)
    {
      accidentFlag = false;
      Serial.println("✅ [ACCIDENT CANCELLED] False alarm cancelled by user");
      blinkLED(3, 100);
    }
  }
  if (debounce(PIN_IMMEDIATE, lastImmediate, msImmediate))
  {
    Serial.println("\n🆘 [IMMEDIATE EMERGENCY] Button pressed!");
    sendEmergencySMS(true);
    accidentFlag = false;
  }
  if (accidentFlag && millis() - accidentMillis >= WAIT_TIME)
  {
    Serial.println("\n⏰ [TIMEOUT REACHED] 5 minutes elapsed, sending emergency SMS...");
    sendEmergencySMS(false);
    accidentFlag = false;
  }
  if (accidentFlag && millis() - lastPrint > 30000)
  {
    lastPrint = millis();
    unsigned long remaining = (WAIT_TIME - (millis() - accidentMillis)) / 1000;
    Serial.printf("⏳ Time remaining: %lu seconds (Press CANCEL to abort)\n", remaining);
  }
  if (accidentFlag)
  {
    if ((millis() % 1000) < 100)
      digitalWrite(PIN_LED, HIGH);
    else
      digitalWrite(PIN_LED, LOW);
  }
  delay(50);
}
