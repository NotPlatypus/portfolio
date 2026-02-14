// ========================================
// TIME-BASED ANIMATION SYSTEM
// Ensures animations run at same speed on 60Hz-240Hz displays
// ========================================

let lastFrameTime = performance.now();
let deltaTime = 0;

function updateDeltaTime(currentTime) {
    deltaTime = (currentTime - lastFrameTime) / 16.67; // Normalize to 60fps baseline
    lastFrameTime = currentTime;
    return deltaTime;
}

// ========================================
// THEME TOGGLE
// ========================================

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const currentTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateSky();
});

// ========================================
// TYPING ANIMATION - TIME-BASED
// Same speed on all refresh rates (60-240Hz)
// ========================================

const typingText = document.querySelector('.typing-text');
const roles = [
    'Full-Stack Developer',
    'Frontend Specialist',
    'Backend Engineer',
    'UI/UX Enthusiast',
    'Problem Solver',
    'Code Craftsman'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let lastTypeTime = 0;
let typingDelay = 150;

function typeWriter(currentTime) {
    if (!lastTypeTime) lastTypeTime = currentTime - 1000; // Initial delay
    
    if (currentTime - lastTypeTime >= typingDelay) {
        const currentRole = roles[roleIndex];
        
        if (!isDeleting) {
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 150; // Type speed
            
            if (charIndex === currentRole.length) {
                isDeleting = true;
                typingDelay = 2000; // Pause at end
            }
        } else {
            typingText.textContent = currentRole.substring(0, charIndex);
            charIndex--;
            typingDelay = 50; // Delete speed
            
            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingDelay = 500; // Pause before next word
            }
        }
        
        lastTypeTime = currentTime;
    }
    
    requestAnimationFrame(typeWriter);
}

// Start typing animation
requestAnimationFrame(typeWriter);

// ========================================
// STARS CANVAS
// ========================================

const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let mouse = { x: 0, y: 0 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
    updateSky();
});

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = 0.3 + Math.random() * 0.7;
    }

    move(dt = 1) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            // Movement normalized by deltaTime
            this.x -= Math.cos(angle) * force * 3 * dt;
            this.y -= Math.sin(angle) * force * 3 * dt;
        }

        // Return speed normalized by deltaTime
        const returnSpeed = 0.05 * dt;
        this.x += (this.originalX - this.x) * returnSpeed;
        this.y += (this.originalY - this.y) * returnSpeed;

        this.opacity += (Math.random() - 0.5) * 0.05 * dt;
        this.opacity = Math.max(0.3, Math.min(1, this.opacity));
    }

    draw() {
        const color = `rgba(139, 92, 246, ${this.opacity})`;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initStars() {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 2000);
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

function animate(currentTime) {
    const dt = updateDeltaTime(currentTime);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.move(dt);
        star.draw();
    });
    requestAnimationFrame(animate);
}

initStars();
requestAnimationFrame(animate);

document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}, { passive: true });

// ========================================
// SKY CANVAS (Sun & Clouds for Light Theme)
// ========================================

const skyCanvas = document.getElementById('sky-canvas');
const skyCtx = skyCanvas.getContext('2d');
let clouds = [];
let birds = [];
let airplane = null;
let sunPulse = 0;

function resizeSkyCanvas() {
    skyCanvas.width = window.innerWidth;
    skyCanvas.height = window.innerHeight;
}

resizeSkyCanvas();

class Cloud {
    constructor() {
        this.x = Math.random() * skyCanvas.width;
        this.y = Math.random() * (skyCanvas.height * 0.4);
        this.speed = 0.2 + Math.random() * 0.3;
        this.size = 60 + Math.random() * 40;
    }

    update(dt = 1) {
        this.x += this.speed * dt;
        if (this.x > skyCanvas.width + 200) {
            this.x = -200;
            this.y = Math.random() * (skyCanvas.height * 0.4);
        }
    }

    draw() {
        skyCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Main cloud body
        skyCtx.beginPath();
        skyCtx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        skyCtx.fill();
        
        skyCtx.beginPath();
        skyCtx.arc(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.4, 0, Math.PI * 2);
        skyCtx.fill();
        
        skyCtx.beginPath();
        skyCtx.arc(this.x - this.size * 0.3, this.y - this.size * 0.1, this.size * 0.35, 0, Math.PI * 2);
        skyCtx.fill();
        
        skyCtx.beginPath();
        skyCtx.arc(this.x + this.size * 0.6, this.y, this.size * 0.45, 0, Math.PI * 2);
        skyCtx.fill();
    }
}

// Ptica klasa
class Bird {
    constructor() {
        this.x = Math.random() * skyCanvas.width;
        this.y = 100 + Math.random() * 200;
        this.speed = 0.5 + Math.random() * 0.01;
        this.wingFlap = 0;
    }

    update(dt = 1) {
        this.x += this.speed * dt;
        this.wingFlap += 0.2 * dt;
        
        if (this.x > skyCanvas.width + 50) {
            this.x = -50;
            this.y = 100 + Math.random() * 200;
        }
    }

    draw() {
        skyCtx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        skyCtx.lineWidth = 2;
        skyCtx.lineCap = 'round';
        
        const wingAngle = Math.sin(this.wingFlap) * 0.3;
        
        // Left wing
        skyCtx.beginPath();
        skyCtx.moveTo(this.x, this.y);
        skyCtx.quadraticCurveTo(
            this.x - 10, this.y - 8 + wingAngle * 10,
            this.x - 15, this.y - 5
        );
        skyCtx.stroke();
        
        // Right wing
        skyCtx.beginPath();
        skyCtx.moveTo(this.x, this.y);
        skyCtx.quadraticCurveTo(
            this.x + 10, this.y - 8 + wingAngle * 10,
            this.x + 15, this.y - 5
        );
        skyCtx.stroke();
    }
}

// Avion klasa
class Airplane {
    constructor() {
        this.x = -100;
        this.y = 150;
        this.speed = 1;
    }

    update(dt = 1) {
        this.x += this.speed * dt;
        
        if (this.x > skyCanvas.width + 150) {
            this.x = -150;
            this.y = 100 + Math.random() * 150;
        }
    }

    draw() {
        skyCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        skyCtx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        skyCtx.lineWidth = 2;
        
        // Body
        skyCtx.fillRect(this.x, this.y, 40, 6);
        
        // Wings
        skyCtx.beginPath();
        skyCtx.moveTo(this.x + 15, this.y);
        skyCtx.lineTo(this.x + 10, this.y - 10);
        skyCtx.lineTo(this.x + 25, this.y - 10);
        skyCtx.lineTo(this.x + 30, this.y);
        skyCtx.closePath();
        skyCtx.fill();
        skyCtx.stroke();
        
        // Tail
        skyCtx.beginPath();
        skyCtx.moveTo(this.x, this.y);
        skyCtx.lineTo(this.x - 8, this.y - 5);
        skyCtx.lineTo(this.x, this.y + 6);
        skyCtx.closePath();
        skyCtx.fill();
        
        // Contrail (trag)
        skyCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        skyCtx.lineWidth = 3;
        skyCtx.beginPath();
        skyCtx.moveTo(this.x - 10, this.y + 3);
        skyCtx.lineTo(this.x - 80, this.y + 3);
        skyCtx.stroke();
    }
}

function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud());
    }
}

function initBirds() {
    birds = [];
    for (let i = 0; i < 6; i++) {
        birds.push(new Bird());
    }
}

function initAirplane() {
    airplane = new Airplane();
}

function updateSky(dt = 1) {
    skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
    
    if (htmlElement.getAttribute('data-theme') === 'light') {
        // Sky gradient - tamniji, lepši plavi
        const gradient = skyCtx.createLinearGradient(0, 0, 0, skyCanvas.height);
        gradient.addColorStop(0, '#5B9BD5');      // Dublja plava
        gradient.addColorStop(0.5, '#87CEEB');    // Srednja plava
        gradient.addColorStop(1, '#B0D4F1');      // Svetlija plava dole
        skyCtx.fillStyle = gradient;
        skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
        
        // Sun - normalized pulse with deltaTime
        sunPulse += 0.02 * dt;
        const sunSize = 60 + Math.sin(sunPulse) * 5;
        const sunX = skyCanvas.width - 150;
        const sunY = 120;
        
        // Sun glow
        const sunGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 2);
        sunGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        skyCtx.fillStyle = sunGradient;
        skyCtx.fillRect(sunX - sunSize * 2, sunY - sunSize * 2, sunSize * 4, sunSize * 4);
        
        // Sun body
        const sunBodyGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize);
        sunBodyGradient.addColorStop(0, '#FFD700');
        sunBodyGradient.addColorStop(1, '#FFA500');
        skyCtx.fillStyle = sunBodyGradient;
        skyCtx.beginPath();
        skyCtx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
        skyCtx.fill();
        
        // Clouds - pass deltaTime
        clouds.forEach(cloud => {
            cloud.update(dt);
            cloud.draw();
        });
        
        // Birds - pass deltaTime
        birds.forEach(bird => {
            bird.update(dt);
            bird.draw();
        });
        
        // Airplane - pass deltaTime
        if (airplane) {
            airplane.update(dt);
            airplane.draw();
        }
    }
}

initClouds();
initBirds();
initAirplane();

let lastSkyUpdate = performance.now();

function animateSky(currentTime) {
    const elapsed = currentTime - lastSkyUpdate;
    const dt = elapsed / 16.67; // Normalize to 60fps
    lastSkyUpdate = currentTime;
    
    updateSky(dt);
    requestAnimationFrame(animateSky);
}

requestAnimationFrame(animateSky);

// ========================================
// SKILLS GENERATION
// ========================================

const skillsData = [
    { name: 'HTML5', icon: 'devicon-html5-plain colored' },
    { name: 'CSS3', icon: 'devicon-css3-plain colored' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    { name: 'Python', icon: 'devicon-python-plain colored' },
    { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
    { name: 'C#', icon: 'devicon-csharp-plain colored' },
    { name: 'Java', icon: 'devicon-java-plain colored' },
    { name: 'Git', icon: 'devicon-git-plain colored' },
    { name: 'GitHub', icon: 'devicon-github-original' },
    { name: 'SQL', icon: 'devicon-mysql-plain colored' },
    { name: 'Apex', icon: 'devicon-salesforce-plain colored' }
];

const skillsGrid = document.getElementById('skillsGrid');

function createSkills() {
    skillsGrid.innerHTML = '';
    skillsData.forEach((skill, index) => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item scroll-reveal';
        skillItem.style.transitionDelay = `${index * 0.05}s`;
        
        skillItem.innerHTML = `
            <i class="${skill.icon}"></i>
            <span>${skill.name}</span>
        `;
        
        skillsGrid.appendChild(skillItem);
    });
}

createSkills();

// ========================================
// TYPING STATS COUNTER
// ========================================

/*function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const suffix = stat.textContent.includes('%') ? '%' : '+';
        let current = 0;
        
        // Svi brojevi traju isto (2 sekunde)
        const duration = 2000;
        const increment = target / (duration / 16); // 60fps
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                stat.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + suffix;
            }
        };
        
        // Start animation when stat card is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    //observer.unobserve(entry.target);
                }
            });
        }, { threshold: 1 });
        
        observer.observe(stat.closest('.stat-card'));
    });
}
*/

// ZAMENI CELU function animateStatNumbers() sa ovim:

function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const suffix = stat.textContent.includes('%') ? '%' : '+';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Kada vidiš karticu - počni brojanje
                    let current = 0;
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    
                    const updateCounter = () => {
                        current += increment;
                        
                        if (current < target) {
                            stat.textContent = Math.floor(current) + suffix;
                            requestAnimationFrame(updateCounter);
                        } else {
                            stat.textContent = target + suffix;
                        }
                    };
                    
                    updateCounter();
                } else {
                    // Kada izađeš iz sekcije - resetuj na 0
                    stat.textContent = '0' + suffix;
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(stat.closest('.stat-card'));
    });
}


// Initialize stats animation
animateStatNumbers();

// ========================================
// NAVIGATION
// ========================================

const navbar = document.getElementById('navbar');
const navLinks = document.querySelector('.nav-links');
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinksItems = document.querySelectorAll('.nav-links a');

// Scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// Mobile menu toggle
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Close menu on link click
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// Active navigation link
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinksItems.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNav, { passive: true });

// ========================================
// SCROLL ANIMATIONS - TRIGGERS EVERY TIME
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

// Remove revealed class when element exits viewport
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        } else {
            // Remove class when element leaves viewport to re-trigger animation
            entry.target.classList.remove('revealed');
        }
    });
}, observerOptions);

// Observe all scroll reveal elements
function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => scrollObserver.observe(el));
}

// Re-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll-reveal class to section elements
    document.querySelectorAll('.section-header, .about-text, .stat-card, .project-card, .hobby-card, .testimonial-card, .timeline-item, .contact-wrapper').forEach(el => {
        el.classList.add('scroll-reveal');
    });
    
    initScrollAnimations();
});

// ========================================
// SMOOTH SCROLLING
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Ako je samo '#' ne radi ništa
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            const navbarHeight = 100; // Offset za navbar
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Pause animations when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations
    } else {
        // Resume animations
        initScrollAnimations();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
});

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('%c🚀 Portfolio Loaded Successfully!', 'color: #6366f1; font-size: 18px; font-weight: bold;');
console.log('%c💻 Built with passion by Aleksa Stanojević', 'color: #764ba2; font-size: 14px;');
console.log('%c⚡ Optimized for all devices and refresh rates (60-240Hz)', 'color: #4facfe; font-size: 12px;');