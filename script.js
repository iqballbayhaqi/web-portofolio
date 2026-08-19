/* ========================================
   GSAP ANIMATIONS & INTERACTIONS
   Portfolio - Iqbal Baihaqi
   ======================================== */

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

/* ========================================
   LOADER ANIMATION
   ======================================== */
const initLoader = async () => {
    // Load content from JSON first
    if (window.contentLoader) {
        await window.contentLoader.init();
    }
    
    const loader = document.getElementById('loader');
    const loaderText = document.querySelector('.loader-text span');
    const loaderBar = document.querySelector('.loader-bar');
    
    const tl = gsap.timeline({
        onComplete: () => {
            gsap.to(loader, {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                onComplete: () => {
                    loader.style.display = 'none';
                    initHeroAnimations();
                    initScrollAnimations();
                }
            });
        }
    });
    
    tl.to(loaderText, {
        y: 0,
        duration: 0.8,
        ease: 'power4.out'
    })
    .to(loaderBar, {
        width: '200px',
        duration: 1.5,
        ease: 'power2.inOut'
    }, '-=0.3');
};

/* ========================================
   HERO ANIMATIONS
   ======================================== */
const initHeroAnimations = () => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    heroTl
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.2
        })
        .to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1.2
        }, '-=0.6')
        .to('.hero-desc', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.8')
        .to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 1
        }, '-=0.6')
        .to('.scroll-indicator', {
            opacity: 1,
            duration: 1
        }, '-=0.4');
};

/* ========================================
   SCROLL ANIMATIONS
   ======================================== */
const initScrollAnimations = () => {
    // About Section
    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });
    
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    });
    
    // Stats Counter Animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        counter.innerHTML = Math.round(this.targets()[0].innerHTML);
                    }
                });
            },
            once: true
        });
    });
    
    // Portfolio Cards
    // Batched on purpose: a per-card `delay: index * 0.15` staggered off the GLOBAL
    // index, so card #13 sat invisible for 1.8s after scrolling into view. With batch,
    // the stagger restarts for each group that enters together.
    const portfolioCards = gsap.utils.toArray('.portfolio-card');
    if (portfolioCards.length) {
        gsap.set(portfolioCards, { y: 60, opacity: 0, scale: 0.95 });

        ScrollTrigger.batch(portfolioCards, {
            start: 'top 90%',
            once: true,
            onEnter: batch => gsap.to(batch, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                // `amount` spreads the whole stagger across the batch instead of adding
                // a fixed gap per card, so jumping straight to the section (anchor link)
                // can never queue a card behind a second of accumulated delay.
                stagger: { amount: 0.3 },
                ease: 'power4.out',
                overwrite: 'auto'
            })
        });
    }
    
    // Skill Cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        gsap.fromTo(card, 
            { y: 80, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power4.out'
            }
        );
    });
    
    // Timeline Items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        gsap.fromTo(item, 
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power4.out',
                onComplete: () => item.classList.add('visible')
            }
        );
    });
    
    // Contact Section - Set initial state and animate
    const contactItems = document.querySelectorAll('.contact-item');
    
    // Set initial hidden state
    gsap.set(contactItems, { 
        y: 40, 
        opacity: 0 
    });
    
    // Create animation
    ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.to(contactItems, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out'
            });
        }
    });
    
    // Check if already in view on page load (for direct navigation to #contact)
    setTimeout(() => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            const rect = contactSection.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                gsap.to(contactItems, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: 'power3.out'
                });
            }
        }
    }, 100);
};

/* ========================================
   PORTFOLIO FILTER
   ----------------------------------------
   Lives in content.js, which owns the filter because the cards only exist
   after data.json is rendered. The copy that used to sit here ran at
   DOMContentLoaded, always found zero cards, and returned early.
   ======================================== */

/* ========================================
   CURSOR FOLLOWER
   ======================================== */
const initCursor = () => {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursor-trail');
    
    if (!cursor || !cursorTrail) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let trailX = 0, trailY = 0;
    
    // Show cursor when mouse enters viewport
    document.addEventListener('mouseenter', () => {
        gsap.to([cursor, cursorTrail], { opacity: 1, duration: 0.3 });
    });
    
    document.addEventListener('mouseleave', () => {
        gsap.to([cursor, cursorTrail], { opacity: 0, duration: 0.3 });
    });
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor animation
    const animateCursor = () => {
        // Main cursor - faster follow
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX - 8 + 'px';
        cursor.style.top = cursorY - 8 + 'px';
        
        // Trail cursor - slower follow
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        cursorTrail.style.left = trailX - 16 + 'px';
        cursorTrail.style.top = trailY - 16 + 'px';
        
        requestAnimationFrame(animateCursor);
    };
    
    animateCursor();
    
    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorTrail.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorTrail.classList.remove('hover');
        });
    });
};

/* ========================================
   NAVBAR SCROLL EFFECT
   ======================================== */
const initNavbar = () => {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                const menuToggle = document.getElementById('menu-toggle');
                mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                menuToggle.classList.remove('active');
                
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target, offsetY: 80 },
                    ease: 'power4.inOut'
                });
            }
        });
    });
};

/* ========================================
   MOBILE MENU
   ======================================== */
const initMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        
        if (mobileMenu.classList.contains('opacity-0')) {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
            
            // Animate menu items
            gsap.from('.mobile-nav-link', {
                y: 50,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power4.out'
            });
        } else {
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        }
    });
};

/* ========================================
   PARALLAX EFFECTS
   ======================================== */
const initParallax = () => {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -100,
            ease: 'none'
        });
    });
};

/* ========================================
   TEXT REVEAL ON SCROLL
   ======================================== */
const initTextReveal = () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const heading = section.querySelector('h2');
        if (heading) {
            gsap.from(heading, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power4.out'
            });
        }
    });
};

/* ========================================
   MAGNETIC BUTTON EFFECT
   ======================================== */
const initMagneticButtons = () => {
    const buttons = document.querySelectorAll('.hero-cta a');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
};

/* ========================================
   FORM INTERACTIONS
   ======================================== */
const initFormInteractions = () => {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        input.addEventListener('blur', () => {
            gsap.to(input, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
    
    // Form submission
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const button = form.querySelector('button');
            const originalText = button.innerHTML;
            
            button.innerHTML = 'Sending...';
            button.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                button.innerHTML = 'Message Sent! ✓';
                button.classList.add('bg-green-500');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                    button.classList.remove('bg-green-500');
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }
};

/* ========================================
   SCROLL PROGRESS INDICATOR
   ======================================== */
const initScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed top-0 left-0 h-0.5 bg-accent z-[100] origin-left';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = scrollProgress + '%';
    });
};

/* ========================================
   INITIALIZE ALL FEATURES
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initNavbar();
    initMobileMenu();
    initParallax();
    initTextReveal();
    initMagneticButtons();
    initFormInteractions();
    initScrollProgress();
    // Portfolio filter is wired up by content.js once the cards are rendered.
});

// Add ScrollTo plugin for smooth navigation
gsap.registerPlugin(ScrollToPlugin);

// Optional: Reload animations on page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        ScrollTrigger.refresh();
    }
});
