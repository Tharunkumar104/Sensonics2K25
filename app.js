// Mobile Navigation Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', function () {
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Countdown Timer
function updateCountdown() {
    // Event date: October 9, 2025
    const eventDate = new Date('2025-10-09T00:00:00').getTime();
    const now = new Date().getTime();
    const timeLeft = eventDate - now;

    // Calculate time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Update the display
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

    // If the countdown is finished
    if (timeLeft < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';

        // You can add special handling for when the event has started
        document.querySelector('.countdown-title').textContent = 'Event is Live!';
    }
}

// Update countdown immediately and then every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Smooth scrolling for navigation links - Fixed implementation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const headerHeight = 70; // Height of fixed navbar
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;

        // Basic validation
        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Simulate form submission (in a real application, you would send this to a server)
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Add scroll effect to navbar
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'linear-gradient(135deg, rgba(0, 31, 63, 0.95) 0%, rgba(0, 116, 217, 0.95) 100%)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #001f3f 0%, #0074D9 100%)';
        navbar.style.backdropFilter = 'none';
    }
});

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.section-title, .section-content, .time-unit');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    .section-title, .section-content, .time-unit {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .section-title.animate, .section-content.animate, .time-unit.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    .time-unit.animate {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Run animation on scroll
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// FAQ Toggle functionality (optional enhancement)
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
        const answer = this.nextElementSibling;
        const isActive = this.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-question').forEach(q => {
            q.classList.remove('active');
            if (q.nextElementSibling) {
                q.nextElementSibling.style.maxHeight = null;
            }
        });

        // Toggle current FAQ item
        if (!isActive && answer) {
            this.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// Add click effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    // Set initial countdown
    updateCountdown();

    // Trigger initial animations
    setTimeout(() => {
        animateOnScroll();
    }, 100);

    // Add loading animation to countdown
    document.querySelectorAll('.time-unit').forEach((unit, index) => {
        unit.style.animationDelay = `${index * 0.1}s`;
    });
});

// Performance optimization: throttle scroll events
let ticking = false;

function updateOnScroll() {
    animateOnScroll();
    ticking = false;
}

window.addEventListener('scroll', function () {
    if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});
const eventRules = {
    // TECHNICAL DOMAIN EVENTS
    'paper-presentation': {
        title: 'Paper Presentation Rules',
        rules: [
            'Teams of 2-4 members are allowed for collaboration',
            'Duration: 10 minutes presentation + 5 minutes Q&A session',
            'Topics must be related to current technological advancements',
            'Original research work or innovative ideas are preferred',
            'PowerPoint presentation is mandatory with maximum 15 slides',
            'All sources and references must be properly cited',
            'Plagiarism will result in immediate disqualification',
            'Participants must submit abstract 2 days before the event',
            'Bring backup copies of presentation in USB drive',
            'Professional attire is required during presentation',
            'Registration deadline: October 6th, 2025',
            'Certificate of participation will be provided to all'
        ]
    },
    'project-presentation': {
        title: 'Project Presentation Rules',
        rules: [
            'Individual or team participation (maximum 5 members)',
            'Duration: 15 minutes presentation + 10 minutes demonstration',
            'Working prototype or detailed model must be presented',
            'Project should solve real-world problems or demonstrate innovation',
            'Technical documentation and source code submission required',
            'Use of any programming language or technology is allowed',
            'Projects must be original work of the participants',
            'Demo setup time of 5 minutes will be provided',
            'Backup arrangements for technical failures should be ready',
            'Judging criteria: Innovation, Technical complexity, Presentation skills',
            'Projects can be hardware, software, or hybrid solutions',
            'Registration closes on October 7th, 2025'
        ]
    },
    'coding-contest': {
        title: 'Coding Contest Rules',
        rules: [
            'Individual participation only - no team collaboration',
            'Duration: 3 hours of intensive competitive programming',
            'Programming languages: C++, Java, Python, JavaScript allowed',
            'Online judge platform will be used for submission',
            'Problems will range from easy to advanced difficulty levels',
            'Internet access restricted except for language documentation',
            'Plagiarism detection software will monitor all submissions',
            'Participants must bring their own laptops and chargers',
            'No external libraries allowed except standard library',
            'Scoring based on correctness, efficiency, and time taken',
            'Tie-breaking based on submission time and penalty points',
            'Winners will be announced immediately after the contest'
        ]
    },
    'circuit-debugging': {
        title: 'Circuit Debugging Rules',
        rules: [
            'Teams of 2-3 members are mandatory for this event',
            'Duration: 2 hours to identify and fix circuit problems',
            'Basic electronics components and tools will be provided',
            'Participants should have knowledge of analog and digital circuits',
            'Multiple faulty circuits with different complexity levels',
            'Multimeter, oscilloscope, and basic tools available',
            'Safety precautions must be followed at all times',
            'Participants cannot damage components intentionally',
            'Scoring based on number of circuits debugged and time taken',
            'Bonus points for explaining the fault and solution method',
            'Prior experience with circuit analysis is recommended',
            'All safety equipment will be provided by organizers'
        ]
    },

    // NON-TECHNICAL DOMAIN EVENTS
    'melodia': {
        title: 'Melodia (Music Competition) Rules',
        rules: [
            'Solo or group performance allowed (maximum 6 members)',
            'Duration: Maximum 5 minutes per performance',
            'Any genre of music is welcome - vocal or instrumental',
            'Participants must bring their own musical instruments',
            'Basic sound system and microphones will be provided',
            'Original compositions will receive extra points',
            'Lyrics should be appropriate and family-friendly',
            'Background music/tracks are allowed but not mandatory',
            'Judging criteria: Melody, rhythm, stage presence, originality',
            'Participants should come prepared with their performance',
            'Registration requires submission of song title and genre',
            'Sound check time of 2 minutes will be allocated before performance'
        ]
    },
    'keys-to-fortune': {
        title: 'Keys to Fortune (Treasure Hunt) Rules',
        rules: [
            'Teams of 3-5 members required for this adventure event',
            'Duration: 2 hours maximum to complete all challenges',
            'Multiple clues and puzzles scattered across the campus',
            'Teams will receive the first clue at the starting point',
            'Mobile phones allowed only for emergency contact',
            'No internet search permitted for solving clues',
            'Teams must stay together throughout the hunt',
            'Cheating or getting help from outsiders leads to disqualification',
            'Physical challenges and mental puzzles included',
            'First team to reach the final destination wins',
            'All team members must be present at each checkpoint',
            'Safety instructions must be followed during outdoor activities'
        ]
    },
    'campus-voyage': {
        title: 'Campus Voyage (Campus Exploration) Rules',
        rules: [
            'Teams of 2-4 members can participate together',
            'Duration: 90 minutes to complete the campus tour challenge',
            'Knowledge about college history and landmarks required',
            'Question-answer format at various campus locations',
            'Teams will receive a map and list of checkpoints',
            'All checkpoints must be visited in the specified order',
            'Photography tasks at specific campus locations',
            'Interaction with faculty and students for bonus points',
            'Teams should maintain discipline and respect campus property',
            'Mobile phones allowed for photography and emergency only',
            'Late submissions will receive penalty points',
            'Winners decided based on accuracy and completion time'
        ]
    },
    'sherlock-sense': {
        title: 'Sherlock Sense (Detective Challenge) Rules',
        rules: [
            'Individual participation or teams of maximum 2 members',
            'Duration: 1.5 hours to solve the mystery case',
            'Participants will receive a fictional crime scene scenario',
            'Clues, evidence, and witness statements provided',
            'Deductive reasoning and logical thinking skills essential',
            'All conclusions must be supported by evidence provided',
            'No external help or internet research allowed',
            'Written submission of the solution with detailed explanation',
            'Judging based on accuracy of deduction and reasoning process',
            'Bonus points for identifying red herrings and false clues',
            'Creative presentation of solution is encouraged',
            'Multiple cases may be provided based on participation'
        ]
    }
};

// Show Rules Modal Function
function showRules(eventKey) {
    const modal = document.getElementById('rules-modal');
    const modalTitle = document.getElementById('modal-title');
    const rulesContent = document.getElementById('rules-content');

    const eventData = eventRules[eventKey];

    if (eventData) {
        modalTitle.textContent = eventData.title;

        const rulesList = document.createElement('ul');
        rulesList.className = 'rules-list';

        eventData.rules.forEach(rule => {
            const listItem = document.createElement('li');
            listItem.textContent = rule;
            rulesList.appendChild(listItem);
        });

        rulesContent.innerHTML = '';
        rulesContent.appendChild(rulesList);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Add smooth animation
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }
}

// Close Rules Modal Function
function closeRulesModal() {
    const modal = document.getElementById('rules-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore background scrolling
}

// Register Event Function
function registerEvent(formUrl) {
    // Replace with actual Google Form URLs for each event
    const googleFormUrls = {
        // Technical Events
        'https://forms.google.com/paper-presentation': 'https://forms.google.com/d/your-paper-presentation-form-id/viewform',
        'https://forms.google.com/project-presentation': 'https://forms.google.com/d/your-project-presentation-form-id/viewform',
        'https://forms.google.com/coding-contest': 'https://forms.google.com/d/your-coding-contest-form-id/viewform',
        'https://forms.google.com/circuit-debugging': 'https://forms.google.com/d/your-circuit-debugging-form-id/viewform',

        // Non-Technical Events
        'https://forms.google.com/melodia': 'https://forms.google.com/d/your-melodia-form-id/viewform',
        'https://forms.google.com/keys-to-fortune': 'https://forms.google.com/d/your-keys-to-fortune-form-id/viewform',
        'https://forms.google.com/campus-voyage': 'https://forms.google.com/d/your-campus-voyage-form-id/viewform',
        'https://forms.google.com/sherlock-sense': 'https://forms.google.com/d/your-sherlock-sense-form-id/viewform'
    };

    // Get the actual form URL or use placeholder
    const actualUrl = googleFormUrls[formUrl] || formUrl;

    // Show confirmation dialog before redirecting
    const eventName = formUrl.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const confirmed = confirm(`You will be redirected to the ${eventName} registration form. Continue?`);

    if (confirmed) {
        // Open registration form in new tab
        window.open(actualUrl, '_blank');

        // Optional: Show success message
        setTimeout(() => {
            alert('Registration form opened in new tab. Please complete the registration process.');
        }, 500);
    }
}

// Close modal when clicking outside the modal content
document.addEventListener('click', function (event) {
    const modal = document.getElementById('rules-modal');
    if (event.target === modal) {
        closeRulesModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('rules-modal');
        if (modal.style.display === 'block') {
            closeRulesModal();
        }
    }
});

// Add smooth scrolling for events navigation
document.addEventListener('DOMContentLoaded', function () {
    // Handle navigation to events section
    const eventsNavLink = document.querySelector('a[href="#events"]');
    if (eventsNavLink) {
        eventsNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('events').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // Add staggered animation for event cards
    const eventCards = document.querySelectorAll('.event-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animations based on domain and card position
                const domainIndex = entry.target.closest('.domain-section') ===
                    document.querySelector('.domain-section') ? 0 : 1;
                const cardIndex = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                const delay = (domainIndex * 4 + cardIndex) * 150;

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
    });

    eventCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add domain title animations
    const domainTitles = document.querySelectorAll('.domain-title');
    domainTitles.forEach((title, index) => {
        title.style.opacity = '0';
        title.style.transform = 'translateX(-30px)';
        title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            title.style.opacity = '1';
            title.style.transform = 'translateX(0)';
        }, index * 300);
    });
});

// Add enhanced hover effects for better user experience
document.addEventListener('DOMContentLoaded', function () {
    const eventCards = document.querySelectorAll('.event-card');

    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            // Add enhanced glow effect
            this.style.boxShadow = '0 25px 50px rgba(0, 116, 217, 0.3), 0 0 30px rgba(0, 116, 217, 0.2)';

            // Slight rotation effect for variety
            const randomRotation = (Math.random() - 0.5) * 2; // -1 to 1 degree
            this.style.transform = `translateY(-15px) scale(1.02) rotate(${randomRotation}deg)`;
        });

        card.addEventListener('mouseleave', function () {
            // Reset to original state
            this.style.boxShadow = '0 10px 30px rgba(0, 116, 217, 0.1)';
            this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        });
    });

    // Add click animation for buttons
    const buttons = document.querySelectorAll('.btn-rules, .btn-register');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 100);
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
});

// Add loading animation for event images
document.addEventListener('DOMContentLoaded', function () {
    const eventImages = document.querySelectorAll('.event-image img');

    eventImages.forEach(img => {
        img.addEventListener('load', function () {
            this.style.opacity = '1';
            this.parentElement.classList.add('loaded');
        });

        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        // Fallback for cached images
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
});

// Add search functionality (optional enhancement)
function searchEvents(query) {
    const eventCards = document.querySelectorAll('.event-card');
    const searchTerm = query.toLowerCase();

    eventCards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm);

        card.style.display = isVisible ? 'block' : 'none';

        if (isVisible) {
            card.style.animation = 'fadeIn 0.5s ease';
        }
    });
}

// Initialize all enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Sensonics2K25 Events Section Loaded Successfully!');
    console.log('Technical Events: Paper Presentation, Project Presentation, Coding Contest, Circuit Debugging');
    console.log('Non-Technical Events: Melodia, Keys to Fortune, Campus Voyage, Sherlock Sense');
});

const images = document.querySelectorAll('.gallery-grid img');
let current = 0;

function showNextImage() {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
}

images[current].classList.add('active');
setInterval(showNextImage, 3000);  // Rotate every 3 seconds
