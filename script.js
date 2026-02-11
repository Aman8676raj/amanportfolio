// Enhanced script.js with Voice Control and Advanced UI Features

// Download Resume Function
function downloadResume() {
    const resumeLink = document.getElementById('downloadResume');
    if (resumeLink) {
        const pdfUrl = resumeLink.getAttribute('href');
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'Aman_Raj_CV.pdf';
        link.target = '_blank';
        
        // Try native download first
        if (link.download !== undefined) {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback: open in new tab
            window.open(pdfUrl, '_blank');
        }
    }
}

// Add download event listener
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadResume');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadResume();
        });
    }
});

// Voice Control Module
class VoiceControl {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.micButton = null;
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.setupEventHandlers();
            this.createMicButton();
            this.createInstructionModal();
        } else {
            console.log('Speech recognition not supported');
            showNotification('Voice control not supported in your browser', 'warning');
        }
    }

    createMicButton() {
        // Create floating mic button
        const micContainer = document.createElement('div');
        micContainer.className = 'voice-control-container';
        micContainer.innerHTML = `
            <button class="mic-button" id="voiceMicButton" aria-label="Voice Control">
                <i class="fas fa-microphone"></i>
                <div class="pulse-ring"></div>
            </button>
            <div class="voice-feedback" id="voiceFeedback">
                <div class="voice-text"></div>
                <div class="voice-waves">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        document.body.appendChild(micContainer);
        this.micButton = document.getElementById('voiceMicButton');

        this.micButton.addEventListener('click', () => this.toggleListening());

        // Add keyboard shortcut (Ctrl + M)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    createInstructionModal() {
        const modal = document.createElement('div');
        modal.className = 'voice-modal';
        modal.innerHTML = `
            <div class="voice-modal-content">
                <h3>🎤 Voice Commands</h3>
                <button class="voice-modal-close">&times;</button>
                <div class="voice-commands-list">
                    <div class="command-group">
                        <h4>Navigation</h4>
                        <ul>
                            <li><span class="command">"Home"</span> - Go to home section</li>
                            <li><span class="command">"Open About"</span> - Navigate to about</li>
                            <li><span class="command">"Open Contact Page"</span> - Go to contact</li>
                            <li><span class="command">"Show Projects"</span> - View projects</li>
                            <li><span class="command">"Go to Skills"</span> - See skills section</li>
                        </ul>
                    </div>
                    <div class="command-group">
                        <h4>Actions</h4>
                        <ul>
                            <li><span class="command">"Dark Mode"</span> - Enable dark theme</li>
                            <li><span class="command">"Light Mode"</span> - Enable light theme</li>
                            <li><span class="command">"Download Resume"</span> - Get CV</li>
                            <li><span class="command">"Send Message"</span> - Focus contact form</li>
                        </ul>
                    </div>
                </div>
                <p class="voice-tip">💡 Tip: Press <kbd>Ctrl</kbd> + <kbd>M</kbd> to toggle voice control</p>
            </div>
        `;

        document.body.appendChild(modal);

        // Show modal on first visit
        if (!localStorage.getItem('voiceInstructionsSeen')) {
            setTimeout(() => {
                modal.classList.add('active');
                localStorage.setItem('voiceInstructionsSeen', 'true');
            }, 3000);
        }

        // Close modal
        modal.querySelector('.voice-modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Help button in mic container
        const helpBtn = document.createElement('button');
        helpBtn.className = 'voice-help-btn';
        helpBtn.innerHTML = '<i class="fas fa-question"></i>';
        helpBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });

        document.querySelector('.voice-control-container').appendChild(helpBtn);
    }

    setupEventHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButton(true);
            this.showFeedback('Listening...');
            this.showNotification('Voice control active. Say a command!', 'info');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton(false);
            this.hideFeedback();
        };

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.toLowerCase();

            this.showFeedback(transcript);

            if (event.results[last].isFinal) {
                this.processCommand(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification('Voice control error. Please try again.', 'error');
            this.updateMicButton(false);
        };
    }

    processCommand(command) {
        console.log('Processing command:', command);

        // Navigation commands
        const navigationCommands = {
            'home': '#home',
            'go home': '#home',
            'about': '#about',
            'go to about': '#about',
            'open about': '#about',
            'skills': '#skills',
            'go to skills': '#skills',
            'open skills': '#skills',
            'projects': '#projects',
            'go to projects': '#projects',
            'open projects': '#projects',
            'contact': '#contact',
            'go to contact': '#contact',
            'open contact': '#contact',
            'open contact page': '#contact',
        };

        // Theme commands
        const themeCommands = {
            'dark mode': 'dark',
            'light mode': 'light',
            'toggle theme': 'toggle',
            'change theme': 'toggle'
        };

        // Action commands
        const actionCommands = {
            'download resume': () => {
                downloadResume();
            },
            'show projects': '#projects',
            'send message': () => {
                const contactForm = document.getElementById('contact-form');
                if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Check navigation commands
        for (const [key, value] of Object.entries(navigationCommands)) {
            if (command.includes(key)) {
                this.navigateToSection(value);
                this.showNotification(`Navigating to ${key} section`, 'success');
                return;
            }
        }

        // Check theme commands
        for (const [key, value] of Object.entries(themeCommands)) {
            if (command.includes(key)) {
                this.changeTheme(value);
                return;
            }
        }

        // Check action commands
        for (const [key, value] of Object.entries(actionCommands)) {
            if (command.includes(key)) {
                if (typeof value === 'function') {
                    value();
                    this.showNotification(`Executing: ${key}`, 'success');
                } else {
                    this.navigateToSection(value);
                }
                return;
            }
        }

        this.showNotification(`Command not recognized: "${command}"`, 'error');
    }

    navigateToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    }

    changeTheme(action) {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme');

        if (action === 'toggle') {
            themeToggle.click();
        } else if (action === 'dark' && currentTheme !== 'dark') {
            themeToggle.click();
        } else if (action === 'light' && currentTheme === 'dark') {
            themeToggle.click();
        }

        this.showNotification(`Theme changed to ${action === 'toggle' ? 'toggled' : action}`, 'success');
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateMicButton(isActive) {
        if (this.micButton) {
            if (isActive) {
                this.micButton.classList.add('active');
                this.micButton.innerHTML = '<i class="fas fa-microphone-slash"></i><div class="pulse-ring"></div>';
            } else {
                this.micButton.classList.remove('active');
                this.micButton.innerHTML = '<i class="fas fa-microphone"></i><div class="pulse-ring"></div>';
            }
        }
    }

    showFeedback(text) {
        const feedback = document.getElementById('voiceFeedback');
        const textElement = feedback.querySelector('.voice-text');
        textElement.textContent = text;
        feedback.classList.add('active');
    }

    hideFeedback() {
        const feedback = document.getElementById('voiceFeedback');
        setTimeout(() => {
            feedback.classList.remove('active');
        }, 1000);
    }

    showNotification(message, type) {
        window.showNotification(message, type);
    }
}

// Advanced UI Enhancements
class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addParticleBackground();
        this.addScrollProgress();
        this.addCursorEffects();
        this.addPageTransitions();
        this.addAdvancedAnimations();
        this.addFloatingElements();
    }

    addParticleBackground() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particleCanvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            z-index: 10000;
            transition: width 0.3s ease;
            width: 0%;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (window.scrollY / scrollHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    addCursorEffects() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: transform 0.2s ease;
            opacity: 0;
        `;
        document.body.appendChild(cursor);

        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        cursorDot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            opacity: 0;
        `;
        document.body.appendChild(cursorDot);

        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursorDot.style.left = e.clientX - 2 + 'px';
            cursorDot.style.top = e.clientY - 2 + 'px';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card');
        hoverElements.forEach(elem => {
            elem.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.borderColor = 'var(--accent-color)';
            });
            elem.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.borderColor = 'var(--primary-color)';
            });
        });
    }

    addPageTransitions() {
        // Add smooth page transitions
        const sections = document.querySelectorAll('section');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');

                    // Update active nav link
                    const sectionId = '#' + entry.target.id;
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            section.classList.add('section-transition');
            sectionObserver.observe(section);
        });
    }

    addAdvancedAnimations() {
        // Add tilt effect to cards
        const tiltElements = document.querySelectorAll('.project-card, .skill-card');

        tiltElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                elem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });

        // Add parallax effect to hero section
        const heroContent = document.querySelector('.hero-content');
        const heroProfile = document.querySelector('.hero-profile');

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const parallaxSpeed = 0.5;

            if (heroContent) {
                heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
            if (heroProfile) {
                heroProfile.style.transform = `translateY(${scrolled * parallaxSpeed * 0.8}px)`;
            }
        });
    }

    addFloatingElements() {
        // Add floating action buttons
        const fabContainer = document.createElement('div');
        fabContainer.className = 'fab-container';
        fabContainer.innerHTML = `
            <div class="fab-menu">
                <button class="fab-button fab-main" id="fabMain">
                    <i class="fas fa-plus"></i>
                </button>
                <div class="fab-options">
                    <button class="fab-button fab-option" data-action="scroll-top" title="Scroll to top">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="fab-button fab-option" data-action="toggle-sound" title="Toggle sound">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(fabContainer);

        const fabMain = document.getElementById('fabMain');
        const fabMenu = document.querySelector('.fab-menu');

        fabMain.addEventListener('click', () => {
            fabMenu.classList.toggle('active');
        });

        // Handle FAB actions
        document.querySelectorAll('.fab-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;

                switch(action) {
                    case 'scroll-top':
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                    case 'toggle-sound':
                        // Toggle sound effects
                        document.body.classList.toggle('sound-enabled');
                        e.currentTarget.querySelector('i').classList.toggle('fa-volume-up');
                        e.currentTarget.querySelector('i').classList.toggle('fa-volume-mute');
                        break;
                }

                fabMenu.classList.remove('active');
            });
        });
    }
}

// Enhanced existing functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initTheme();
    initNavigation();
    initProgressBars();
    initProjectAnimation();
    initContactForm();
    initSmoothScrolling();

    // Initialize new features
    const voiceControl = new VoiceControl();
    const uiEnhancements = new UIEnhancements();

    // Add loading screen (removed)

    // Add sound effects
    addSoundEffects();

    console.log('Portfolio loaded successfully! 🚀');
});

// Loading Screen
function addLoadingScreen() {
    const loader = document.createElement('div');
    loader.className = 'loading-screen';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <span class="loader-text">AR</span>
            </div>
            <div class="loader-progress">
                <div class="loader-bar"></div>
            </div>
            <p class="loader-status">Loading amazing things...</p>
        </div>
    `;

    document.body.appendChild(loader);

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
                document.body.classList.add('loaded');
            }, 500);
        }, 1000);
    });
}

// Sound Effects
function addSoundEffects() {
    const sounds = {
        click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGH0fPTgjMGHm7A7+OZURE',
        hover: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGH0fPTgjMGHm7A7+OZURE',
    };

    const playSound = (type) => {
        if (document.body.classList.contains('sound-enabled')) {
            const audio = new Audio(sounds[type]);
            audio.volume = 0.1;
            audio.play().catch(() => {});
        }
    };

    // Add sound to buttons and links
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, a')) {
            playSound('click');
        }
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('button, a, .card')) {
            playSound('hover');
        }
    });
}

// Enhanced Notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="notification-text">
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-progress"></div>
    `;

    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // Animate progress bar
    setTimeout(() => {
        notification.querySelector('.notification-progress').style.width = '100%';
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('notification-exit');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}
// ===== CERTIFICATES DATA =====
const certificatesData = [
    {
        image: 'images/certificates/certificate1.jpg',
        title: 'Web Development Bootcamp',
        issuer: 'Udemy',
        date: 'January 2024'
    },
    {
        image: 'images/certificates/certificate2.jpg',
        title: 'JavaScript Advanced',
        issuer: 'Coursera',
        date: 'March 2024'
    },
    {
        image: 'images/certificates/certificate3.jpg',
        title: 'React.js Fundamentals',
        issuer: 'freeCodeCamp',
        date: 'May 2024'
    },
    {
        image: 'images/certificates/certificate4.jpg',
        title: 'Node.js Backend Development',
        issuer: 'Udemy',
        date: 'June 2024'
    },
    {
        image: 'images/certificates/certificate5.jpg',
        title: 'MongoDB Database',
        issuer: 'MongoDB University',
        date: 'July 2024'
    },
    {
        image: 'images/certificates/certificate6.jpg',
        title: 'Data Structures & Algorithms',
        issuer: 'GeeksforGeeks',
        date: 'August 2024'
    }
    // Add more certificates here as needed
];

let currentCertIndex = 0;

// Open single certificate modal
function openCertModal(index) {
    currentCertIndex = index;
    const modal = document.getElementById('certModal');
    updateCertModal();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close certificate modal
function closeCertModal() {
    const modal = document.getElementById('certModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Update certificate modal content
function updateCertModal() {
    const cert = certificatesData[currentCertIndex];
    document.getElementById('modalCertImage').src = cert.image;
    document.getElementById('modalCertTitle').textContent = cert.title;
    document.getElementById('modalCertIssuer').textContent = `${cert.issuer} • ${cert.date}`;
    document.getElementById('certCounter').textContent = `${currentCertIndex + 1} / ${certificatesData.length}`;
}

// Previous certificate
function prevCert() {
    currentCertIndex = currentCertIndex > 0 ? currentCertIndex - 1 : certificatesData.length - 1;
    updateCertModal();
}

// Next certificate
function nextCert() {
    currentCertIndex = currentCertIndex < certificatesData.length - 1 ? currentCertIndex + 1 : 0;
    updateCertModal();
}

// Open all certificates modal
function openAllCertificates() {
    const modal = document.getElementById('allCertsModal');
    const grid = document.getElementById('allCertsGrid');
    
    // Clear previous content
    grid.innerHTML = '';
    
    // Populate all certificates
    certificatesData.forEach((cert, index) => {
        const certItem = document.createElement('div');
        certItem.className = 'all-cert-item';
        certItem.onclick = () => {
            closeAllCertificates();
            setTimeout(() => openCertModal(index), 300);
        };
        
        certItem.innerHTML = `
            <img src="${cert.image}" alt="${cert.title}">
            <div class="all-cert-item-info">
                <h4>${cert.title}</h4>
                <p>${cert.issuer} • ${cert.date}</p>
            </div>
        `;
        
        grid.appendChild(certItem);
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close all certificates modal
function closeAllCertificates() {
    const modal = document.getElementById('allCertsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    const certModal = document.getElementById('certModal');
    const allCertsModal = document.getElementById('allCertsModal');
    
    if (certModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') prevCert();
        if (e.key === 'ArrowRight') nextCert();
        if (e.key === 'Escape') closeCertModal();
    }
    
    if (allCertsModal.classList.contains('active')) {
        if (e.key === 'Escape') closeAllCertificates();
    }
});
// Enhanced smooth scrolling with progress indication
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Add scrolling indicator
                const scrollIndicator = document.createElement('div');
                scrollIndicator.className = 'scroll-indicator';
                document.body.appendChild(scrollIndicator);

                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Remove indicator after scroll
                setTimeout(() => scrollIndicator.remove(), 1000);

                // Update URL without adding to history
                history.replaceState(null, null, targetId);
            }
        });
    });
}

// Make the window.showNotification function available globally
window.showNotification = showNotification;

// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark', themeIcon);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme, themeIcon);
    });
}

function setTheme(theme, iconElement) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        iconElement.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.removeAttribute('data-theme');
        iconElement.classList.replace('fa-sun', 'fa-moon');
    }
    localStorage.setItem('theme', theme);
}

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container') && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Progress bar animation
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');

    progressBars.forEach(bar => {
        const width = bar.getAttribute('data-width') || '0%';
        bar.style.width = width;
    });
}

// Project card animation on scroll
function initProjectAnimation() {
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length === 0) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form validation and submission
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = this.querySelector('input[name="name"]').value.trim();
        const email = this.querySelector('input[name="email"]').value.trim();
        const subject = this.querySelector('input[name="subject"]').value.trim();
        const message = this.querySelector('textarea[name="message"]').value.trim();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Send to backend
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Message sent successfully!', 'success');
                this.reset();
            } else {
                showNotification('Failed to send message.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Skills Category Tabs Functionality
function initSkillsTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const skillsCategories = document.querySelectorAll('.skills-category');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all categories
            skillsCategories.forEach(category => {
                category.classList.remove('active');
            });

            // Show selected category
            const categoryId = tab.getAttribute('data-category');
            const selectedCategory = document.getElementById(categoryId);
            if (selectedCategory) {
                selectedCategory.classList.add('active');
                // Animate progress bars in the selected category
                animateProgressBars(selectedCategory);
            }
        });
    });
}

// Animate progress bars with enhanced effects
function animateProgressBars(container = document) {
    const progressBars = container.querySelectorAll('.progress-bar');
    progressBars.forEach((bar, index) => {
        // Reset width first
        bar.style.width = '0';

        // Add animated class
        bar.classList.add('animated');

        // Set custom property for animation
        const width = bar.getAttribute('data-width') || '0%';
        bar.style.setProperty('--progress-width', width);

        // Stagger animation
        setTimeout(() => {
            bar.style.width = width;
        }, index * 150);
    });
}

// Enhanced skill card interactions
function initSkillCardInteractions() {
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add glow effect
            card.style.boxShadow = 'var(--shadow-violet), 0 0 40px rgba(124, 58, 237, 0.3)';
        });

        card.addEventListener('mouseleave', () => {
            // Reset shadow
            card.style.boxShadow = 'var(--shadow-violet)';
        });

        // Add click effect
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

// About Section Animations and Interactions
function initAboutAnimations() {
    // Animate stats numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((number, index) => {
        setTimeout(() => {
            animateNumber(number);
        }, index * 200);
    });

    // Add hover effects for tech tags
    const techTags = document.querySelectorAll('.tech-tag');
    techTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-3px) scale(1.05)';
        });

        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effect for stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

// Animate numbers counting up
function animateNumber(element) {
    const target = parseInt(element.textContent.replace('+', ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Enhanced text highlight effects
function initTextHighlights() {
    const violetTexts = document.querySelectorAll('.violet-text');

    violetTexts.forEach(text => {
        text.addEventListener('mouseenter', () => {
            text.style.color = 'var(--violet-secondary)';
        });

        text.addEventListener('mouseleave', () => {
            text.style.color = 'var(--violet-primary)';
        });
    });
}

// Project Cards Interactions
function initProjectCardInteractions() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach((card, index) => {
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
            card.style.boxShadow = 'var(--shadow-violet), 0 0 40px rgba(124, 58, 237, 0.3)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        // Add click effect
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });

        // Add image loading effect
        const img = card.querySelector('img');
        if (img) {
            img.addEventListener('load', () => {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 100);
            });
        }
    });
}

// Enhanced project link interactions
function initProjectLinkInteractions() {
    const projectLinks = document.querySelectorAll('.project-link');

    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-5px) scale(1.1)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
        });
    });
}

// Initialize animations when page loads
window.addEventListener('load', function() {
    // Initialize skills tabs
    initSkillsTabs();

    // Initialize skill card interactions
    initSkillCardInteractions();

    // Initialize About section animations
    initAboutAnimations();

    // Initialize text highlights
    initTextHighlights();

    // Initialize project card interactions
    initProjectCardInteractions();

    // Initialize project link interactions
    initProjectLinkInteractions();

    // Animate initial progress bars
    animateProgressBars();

    // Add loaded class for any post-load animations
    document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        document.body.classList.add('loaded');
    }
});

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Image failed to load:', e.target.src);
    }
}, true);

// Image loading handler
function handleImageLoading() {
    const projectImages = document.querySelectorAll('.project-image img');

    projectImages.forEach(img => {
        // Check if image loaded successfully
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('loaded');
        } else {
            // If image fails to load
            img.style.display = 'none';
            const projectCard = img.closest('.project-image');
            const projectName = projectCard.closest('.project-card').querySelector('h3').textContent;

            projectCard.classList.add('fallback');
            projectCard.setAttribute('data-project-name', projectName);

            // Add icon based on project type
            const icon = document.createElement('i');
            if (projectName.includes('SkillCraft')) {
                icon.className = 'fas fa-graduation-cap';
            } else if (projectName.includes('TimeFlow')) {
                icon.className = 'fas fa-stopwatch';
            } else {
                icon.className = 'fas fa-briefcase';
            }

            projectCard.appendChild(icon);
        }

        // Load event listener
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });

        // Error event listener
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const projectCard = this.closest('.project-image');
            const projectName = projectCard.closest('.project-card').querySelector('h3').textContent;

            projectCard.classList.add('fallback');
            projectCard.setAttribute('data-project-name', projectName);

            // Add appropriate icon
            const icon = document.createElement('i');
            if (projectName.includes('SkillCraft')) {
                icon.className = 'fas fa-graduation-cap';
            } else if (projectName.includes('TimeFlow')) {
                icon.className = 'fas fa-stopwatch';
            } else {
                icon.className = 'fas fa-briefcase';
            }

            projectCard.appendChild(icon);
        });
    });
}

// Initialize image loading
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    handleImageLoading();
});
