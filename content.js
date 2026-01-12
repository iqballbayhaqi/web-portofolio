/* ========================================
   CONTENT LOADER
   Load all content from data.json
   ======================================== */

class ContentLoader {
    constructor() {
        this.data = null;
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    async init() {
        try {
            const response = await fetch('data.json');
            this.data = await response.json();
            this.renderAll();
            console.log('✅ Content loaded successfully from data.json');
        } catch (error) {
            console.error('❌ Error loading content:', error);
        }
    }

    // Calculate duration from period string (e.g., "Jan 2024 - Present" or "May 2023 - Dec 2023")
    calculateDuration(period) {
        const parts = period.split(' - ');
        if (parts.length !== 2) return '';
        
        const parseDate = (dateStr) => {
            if (dateStr.toLowerCase() === 'present') {
                return new Date();
            }
            const [monthStr, year] = dateStr.split(' ');
            const monthIndex = this.months.indexOf(monthStr);
            return new Date(parseInt(year), monthIndex);
        };
        
        const startDate = parseDate(parts[0].trim());
        const endDate = parseDate(parts[1].trim());
        
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months += endDate.getMonth() - startDate.getMonth();
        months += 1; // Include the start month
        
        if (months < 1) return '< 1 month';
        if (months === 1) return '1 month';
        if (months < 12) return `${months} months`;
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (remainingMonths === 0) {
            return years === 1 ? '1 year' : `${years} years`;
        }
        
        const yearStr = years === 1 ? '1 year' : `${years} years`;
        const monthStr = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
        
        return `${yearStr} ${monthStr}`;
    }

    renderAll() {
        if (!this.data) return;
        
        this.renderLoader();
        this.renderProfile();
        this.renderStats();
        this.renderSkills();
        this.renderPortfolio();
        this.renderExperience();
        this.renderEducation();
        this.renderSocial();
        this.renderHirePlatforms();
        this.renderSEO();
        
        // Initialize portfolio filter after content is rendered
        this.initPortfolioFilter();
    }
    
    // ========================================
    // PORTFOLIO FILTER
    // ========================================
    initPortfolioFilter() {
        const tabs = document.querySelectorAll('.portfolio-tab');
        const cards = document.querySelectorAll('.portfolio-card');
        
        if (!tabs.length || !cards.length) return;
        
        // Initialize all cards as visible
        cards.forEach(card => card.classList.add('show'));
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab styling
                tabs.forEach(t => {
                    t.classList.remove('active', 'bg-accent', 'text-dark');
                    t.classList.add('bg-dark', 'border', 'border-white/10', 'text-text-secondary');
                });
                tab.classList.add('active', 'bg-accent', 'text-dark');
                tab.classList.remove('bg-dark', 'border', 'border-white/10', 'text-text-secondary');
                
                const filter = tab.getAttribute('data-filter');
                
                // Filter cards
                cards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    const shouldShow = filter === 'all' || (categories && categories.includes(filter));
                    
                    if (shouldShow) {
                        card.classList.remove('hidden');
                        card.classList.add('show');
                        card.style.display = '';
                    } else {
                        card.classList.remove('show');
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // LOADER
    // ========================================
    renderLoader() {
        const { profile } = this.data;
        this.setText('.loader-name', profile.loaderText || profile.nickname || 'LOADING');
    }

    // ========================================
    // PROFILE
    // ========================================
    renderProfile() {
        const { profile } = this.data;
        
        // Hero Section
        this.setText('.hero-title', profile.name);
        this.setText('.hero-subtitle', `${profile.title}`);
        this.setText('.hero-tagline', profile.tagline);
        this.setText('.hero-description-text', profile.heroDescription);
        this.setText('.hero-company', profile.company);
        
        // About Section
        this.setText('.about-bio', profile.bio);
        this.setAttr('.about-photo', 'src', profile.photo);
        this.setAttr('.about-photo', 'alt', profile.name);
        
        // Code decoration
        this.setText('.code-name', `name: "${profile.name}",`);
        this.setText('.code-role', `role: "${profile.title}",`);
        this.setText('.code-company', `company: "${profile.company}"`);
        
        // Available badge
        const badge = document.querySelector('.available-badge');
        if (badge) {
            badge.style.display = profile.available_for_hire ? 'block' : 'none';
        }
        
        // Contact email
        this.setText('.contact-email', profile.email);
        this.setAttr('.contact-email-link', 'href', `mailto:${profile.email}`);
        
        // Download CV
        if (profile.resume) {
            this.setAttr('.download-cv-link', 'href', profile.resume);
        }
        
        // Footer
        this.setText('.footer-name', profile.name);
    }

    // ========================================
    // STATS
    // ========================================
    renderStats() {
        const { stats } = this.data;
        const container = document.querySelector('.stats-container');
        if (!container) return;
        
        container.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <span class="block font-display text-4xl md:text-5xl font-bold text-accent counter" data-target="${stat.value}">0</span>
                <span class="text-text-secondary text-sm">${stat.label}</span>
            </div>
        `).join('');
    }

    // ========================================
    // SKILLS
    // ========================================
    renderSkills() {
        const { skills } = this.data;
        const container = document.querySelector('.skills-container');
        if (!container) return;
        
        container.innerHTML = skills.map(skill => `
            <div class="skill-card group p-8 bg-dark rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-500 hover:-translate-y-2">
                <div class="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <i class="${skill.icon} text-3xl text-accent"></i>
                </div>
                <h3 class="font-display text-xl font-bold mb-4">${skill.title}</h3>
                <div class="flex flex-wrap gap-2">
                    ${skill.technologies.map(tech => `
                        <span class="tech-tag px-3 py-1.5 bg-dark-light rounded-full text-sm text-text-secondary flex items-center gap-2">
                            <i class="${tech.icon}" style="color: ${tech.color}"></i> ${tech.name}
                        </span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // ========================================
    // PORTFOLIO
    // ========================================
    renderPortfolio() {
        const { portfolio, portfolioFilters } = this.data;
        
        // Sort portfolio: featured items first, then by year (newest first)
        const sortedPortfolio = [...portfolio].sort((a, b) => {
            // Featured items first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            // Then by year (newest first)
            return parseInt(b.year) - parseInt(a.year);
        });
        
        // Render filters
        const filtersContainer = document.querySelector('.portfolio-filters');
        if (filtersContainer) {
            filtersContainer.innerHTML = portfolioFilters.map((filter, index) => `
                <button class="portfolio-tab ${index === 0 ? 'active' : ''} px-6 py-3 rounded-full font-mono text-sm transition-all duration-300 ${index === 0 ? 'bg-accent text-dark' : 'bg-dark border border-white/10 text-text-secondary hover:border-accent/50 hover:text-accent'}" data-filter="${filter.id}">
                    ${filter.icon ? `<span class="flex items-center gap-2">${this.getFilterIcon(filter.icon)} ${filter.label}</span>` : filter.label}
                </button>
            `).join('') + `
                <a href="https://iqbalbaihaqi.itch.io/" target="_blank" rel="noopener noreferrer" class="px-6 py-3 rounded-full font-mono text-sm transition-all duration-300 bg-dark border border-white/10 text-text-secondary hover:border-accent/50 hover:text-accent">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.13 1.338C2.08 1.96 1.5 2.895 1.5 4.212v3.588c0 .668.384 1.235.896 1.632.512.396 1.088.568 1.604.568.768 0 1.344-.344 1.688-.712.344-.368.524-.776.712-1.128.188.352.368.76.712 1.128.344.368.92.712 1.688.712s1.344-.344 1.688-.712c.344-.368.524-.776.712-1.128.188.352.368.76.712 1.128.344.368.92.712 1.688.712s1.344-.344 1.688-.712c.344-.368.524-.776.712-1.128.188.352.368.76.712 1.128.344.368.92.712 1.688.712.516 0 1.092-.172 1.604-.568.512-.397.896-.964.896-1.632V4.212c0-1.317-.58-2.252-1.63-2.874C18.542.716 17.104.5 15.5.5h-7C6.896.5 5.458.716 4.13 1.338zm.37 9.662v11.5h17V11H3.5zm2 2h4v5h-4v-5zm6 0h4v2h-4v-2z"/></svg>
                        Itch.io
                    </span>
                </a>
            `;
        }
        
        // Render portfolio cards
        const container = document.querySelector('#portfolio-grid');
        if (!container) return;
        
        container.innerHTML = sortedPortfolio.map(project => `
            <div class="portfolio-card group relative bg-dark rounded-2xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500" data-category="${project.category.join(' ')}">
                <div class="aspect-video bg-gradient-to-br from-${project.color}/20 via-${project.color}/10 to-dark overflow-hidden relative">
                    ${project.image ? `
                        <img src="${project.image}" alt="${project.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div class="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent"></div>
                    ` : `
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                ${this.renderProjectLogo(project)}
                                <span class="font-mono text-xs text-text-secondary px-3 py-1 bg-dark/50 rounded-full">${project.subtitle}</span>
                            </div>
                        </div>
                    `}
                    <div class="absolute inset-0 bg-dark/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                        ${project.links.demo ? `
                            <a href="${project.links.demo}" target="_blank" class="w-12 h-12 bg-${project.color} rounded-full flex items-center justify-center text-dark hover:scale-110 transition-transform">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                        ` : ''}
                        ${project.links.github ? `
                            <a href="${project.links.github}" target="_blank" class="w-12 h-12 bg-${project.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="px-2 py-1 bg-${project.color}/10 rounded text-xs text-${project.color.replace('-500', '-400')} font-mono">${project.type}</span>
                        <span class="px-2 py-1 bg-purple-500/10 rounded text-xs text-purple-400 font-mono">${project.year}</span>
                    </div>
                    <h3 class="font-display text-xl font-bold mb-2 group-hover:text-${project.color.replace('-500', '-400')} transition-colors">${project.title}</h3>
                    <p class="text-text-secondary text-sm mb-4 line-clamp-2">${project.description}</p>
                    <div class="flex flex-wrap gap-2">
                        ${project.technologies.map(tech => `
                            <span class="px-2 py-1 bg-dark-light rounded text-xs text-text-secondary flex items-center gap-1.5">
                                <i class="${this.getTechIcon(tech)}" style="color: ${this.getTechColor(tech)}"></i>
                                ${tech}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderProjectLogo(project) {
        if (project.logoType === 'text') {
            return `<div class="text-5xl font-display font-bold text-${project.color.replace('-500', '-400')} mb-2">${project.logo}</div>`;
        } else if (project.logoType === 'devicon') {
            return `<div class="w-16 h-16 mx-auto mb-3 bg-${project.color}/20 rounded-2xl flex items-center justify-center">
                <i class="devicon-${project.logo}-plain text-3xl text-${project.color.replace('-500', '-400')}"></i>
            </div>`;
        } else {
            return `<div class="w-16 h-16 mx-auto mb-3 bg-${project.color}/20 rounded-2xl flex items-center justify-center">
                ${this.getProjectIcon(project.logo, project.color)}
            </div>`;
        }
    }

    getProjectIcon(icon, color) {
        const icons = {
            'chart': `<svg class="w-8 h-8 text-${color.replace('-500', '-400')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
            'phone': `<svg class="w-8 h-8 text-${color.replace('-500', '-400')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
            'puzzle': `<svg class="w-8 h-8 text-${color.replace('-500', '-400')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>`
        };
        return icons[icon] || icons['chart'];
    }

    getFilterIcon(icon) {
        const icons = {
            'globe': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`,
            'phone': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
            'play': `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        };
        return icons[icon] || '';
    }

    // ========================================
    // TECH ICONS (for portfolio)
    // ========================================
    getTechIcon(tech) {
        const techIcons = {
            'React.js': 'devicon-react-original',
            'React': 'devicon-react-original',
            'React Native': 'devicon-react-original',
            'Next.js': 'devicon-nextjs-plain',
            'Vue.js': 'devicon-vuejs-plain',
            'TypeScript': 'devicon-typescript-plain',
            'JavaScript': 'devicon-javascript-plain',
            'Node.js': 'devicon-nodejs-plain',
            'Express.js': 'devicon-express-original',
            'Laravel': 'devicon-laravel-original',
            'MySQL': 'devicon-mysql-plain',
            'PostgreSQL': 'devicon-postgresql-plain',
            'MongoDB': 'devicon-mongodb-plain',
            'Firebase': 'devicon-firebase-plain',
            'GraphQL': 'devicon-graphql-plain',
            'HTML5': 'devicon-html5-plain',
            'CSS3': 'devicon-css3-plain',
            'Tailwind': 'devicon-tailwindcss-original',
            'SASS': 'devicon-sass-original',
            'SCSS': 'devicon-sass-original',
            'Google Ads': 'devicon-google-plain',
            'Material UI': 'devicon-materialui-plain',
            'Ant Design': 'devicon-antdesign-plain',
            'Styled Components': 'devicon-css3-plain',
            'Unity': 'devicon-unity-plain',
            'C#': 'devicon-csharp-plain',
            'Android': 'devicon-android-plain',
            'Expo': 'devicon-react-original',
            'Redux': 'devicon-redux-original',
            'Vercel': 'devicon-vercel-plain',
            'Git': 'devicon-git-plain',
            'Figma': 'devicon-figma-plain',
            'Java': 'devicon-java-plain'
        };
        return techIcons[tech] || 'devicon-devicon-plain';
    }

    getTechColor(tech) {
        const techColors = {
            'React.js': '#61DAFB',
            'React': '#61DAFB',
            'React Native': '#61DAFB',
            'Next.js': '#ffffff',
            'Vue.js': '#4FC08D',
            'TypeScript': '#3178C6',
            'JavaScript': '#F7DF1E',
            'Node.js': '#339933',
            'Express.js': '#ffffff',
            'Laravel': '#FF2D20',
            'MySQL': '#4479A1',
            'PostgreSQL': '#4169E1',
            'MongoDB': '#47A248',
            'Firebase': '#FFCA28',
            'GraphQL': '#E10098',
            'HTML5': '#E34F26',
            'CSS3': '#1572B6',
            'Tailwind': '#06B6D4',
            'SASS': '#CC6699',
            'SCSS': '#CC6699',
            'Google Ads': '#4285F4',
            'Material UI': '#007FFF',
            'Ant Design': '#1890FF',
            'Styled Components': '#DB7093',
            'Unity': '#ffffff',
            'C#': '#512BD4',
            'Android': '#3DDC84',
            'Expo': '#000020',
            'Redux': '#764ABC',
            'Vercel': '#ffffff',
            'Git': '#F05032',
            'Figma': '#F24E1E',
            'Java': '#007396'
        };
        return techColors[tech] || '#9ca3af';
    }

    // ========================================
    // EXPERIENCE
    // ========================================
    renderExperience() {
        const { experience } = this.data;
        const container = document.querySelector('.experience-timeline');
        if (!container) return;
        
        // Timeline Line + Experience Items
        container.innerHTML = `
            <!-- Timeline Line -->
            <div class="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent md:-translate-x-1/2"></div>
        ` + experience.map((exp, index) => `
            <div class="timeline-item relative flex flex-col md:flex-row gap-8 ${index < experience.length - 1 ? 'mb-12 md:mb-16' : ''}">
                <!-- Timeline Dot -->
                <div class="absolute left-0 md:left-1/2 w-4 h-4 bg-${exp.color} rounded-full md:-translate-x-1/2 ring-4 ring-${exp.color}/20 z-10">
                    ${exp.isCurrent ? '<div class="absolute inset-0 bg-accent rounded-full animate-ping opacity-50"></div>' : ''}
                </div>
                
                <!-- Date -->
                <div class="md:w-1/2 md:text-right md:pr-12 pl-8 md:pl-0">
                    ${exp.isCurrent ? `
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/30 mb-4">
                            <span class="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                            <span class="font-mono text-accent text-sm">Current Position</span>
                        </div>
                    ` : `<p class="font-mono text-${exp.color.replace('-500', '-400')} text-sm mb-1">${exp.position}</p>`}
                    <p class="font-mono text-text-secondary text-sm">${exp.period}</p>
                    <p class="text-text-secondary/60 text-sm">${this.calculateDuration(exp.period)}${exp.type !== 'Full-time' ? ` (${exp.type})` : ''}</p>
                </div>
                
                <!-- Content -->
                <div class="md:w-1/2 pl-8 md:pl-12">
                    <div class="group p-6 bg-dark-light rounded-2xl border border-white/5 hover:border-${exp.color}/30 transition-all duration-500 hover:-translate-y-1">
                        <div class="flex items-start gap-4 mb-4">
                            <div class="w-14 h-14 bg-${exp.color}/20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                ${exp.logo ? 
                                    `<img src="${exp.logo}" alt="${exp.company}" class="w-full h-full ${exp.logoFit === 'contain' ? 'object-contain bg-white p-1' : 'object-cover'} rounded-xl">` :
                                    exp.isDevicon ? 
                                        `<i class="devicon-${exp.companyShort}-plain text-2xl text-${exp.color.replace('-500', '-400')}"></i>` : 
                                        `<span class="font-display text-${exp.companyShort.length > 3 ? 'lg' : '2xl'} font-bold text-${exp.color.replace('-500', '-400')}">${exp.companyShort}</span>`
                                }
                            </div>
                            <div>
                                <h3 class="font-display text-xl font-bold text-white">${exp.position}</h3>
                                <p class="text-${exp.color.replace('-500', '-400')}">${exp.company}</p>
                                ${exp.location ? `
                                    <p class="text-text-secondary/60 text-xs mt-1 flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        ${exp.location}
                                    </p>
                                ` : ''}
                                ${exp.vendor ? `
                                    <div class="relative group/vendor inline-block">
                                        <p class="text-text-secondary/60 text-xs mt-1 cursor-help border-b border-dashed border-text-secondary/30">via ${exp.vendor}</p>
                                        <div class="absolute left-0 bottom-full mb-2 px-3 py-2 bg-dark border border-white/10 rounded-lg text-xs text-text-secondary opacity-0 invisible group-hover/vendor:opacity-100 group-hover/vendor:visible transition-all duration-200 whitespace-nowrap z-20 shadow-lg">
                                            <div class="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/10"></div>
                                            Outsourced via ${exp.vendor}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <p class="text-text-secondary text-sm mb-4 leading-relaxed">${exp.description}</p>
                        <div class="flex flex-wrap gap-2">
                            ${exp.technologies.map(tech => `
                                <span class="px-2.5 py-1 bg-dark rounded-lg text-xs text-${exp.color.replace('-500', '-400')} border border-${exp.color}/20 flex items-center gap-1.5">
                                    <i class="${this.getTechIcon(tech)}" style="color: ${this.getTechColor(tech)}"></i>
                                    ${tech}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('') + `
            <!-- Timeline End -->
            <div class="absolute left-0 md:left-1/2 bottom-0 w-3 h-3 bg-dark-light border-2 border-text-secondary/30 rounded-full md:-translate-x-1/2"></div>
        `;
    }

    // ========================================
    // EDUCATION
    // ========================================
    renderEducation() {
        const { education } = this.data;
        if (!education) return;
        
        const container = document.getElementById('education-container');
        if (!container) return;

        container.innerHTML = education.map(edu => `
            <div class="education-card group relative">
                <!-- Main Card -->
                <div class="relative bg-dark rounded-3xl border border-white/5 hover:border-${edu.color}/30 transition-all duration-500 overflow-hidden">
                    <!-- Background Gradient -->
                    <div class="absolute top-0 right-0 w-96 h-96 bg-${edu.color}/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${edu.color}/20 transition-all duration-500"></div>
                    
                    <div class="relative p-8 md:p-12">
                        <div class="flex flex-col lg:flex-row gap-8 items-start">
                            <!-- Logo & Badge -->
                            <div class="flex-shrink-0">
                                <div class="relative">
                                    <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-${edu.color}/20 flex items-center justify-center border border-${edu.color}/30 group-hover:scale-105 transition-transform duration-500">
                                        ${edu.logo ? 
                                            `<img src="${edu.logo}" alt="${edu.institution}" class="w-full h-full object-cover rounded-2xl">` :
                                            `<span class="font-display text-4xl md:text-5xl font-bold text-${edu.color.replace('-500', '-400')}">${edu.logoText || edu.institution.charAt(0)}</span>`
                                        }
                                    </div>
                                    <!-- Type Badge -->
                                    <div class="absolute -bottom-2 -right-2 px-3 py-1 bg-${edu.color} text-dark text-xs font-bold rounded-full uppercase tracking-wide">
                                        ${edu.type}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Content -->
                            <div class="flex-1">
                                <!-- Header -->
                                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                    <div>
                                        <h3 class="font-display text-2xl md:text-3xl font-bold text-white group-hover:text-${edu.color.replace('-500', '-400')} transition-colors">
                                            ${edu.institution}
                                        </h3>
                                        <p class="text-${edu.color.replace('-500', '-400')} font-semibold text-lg mt-1">
                                            ${edu.program}
                                        </p>
                                        <div class="flex flex-wrap items-center gap-4 mt-3 text-text-secondary text-sm">
                                            <span class="flex items-center gap-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                ${edu.period}
                                            </span>
                                            <span class="flex items-center gap-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                </svg>
                                                ${edu.location}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    ${edu.featured ? `
                                        <div class="flex items-center gap-2 px-4 py-2 bg-${edu.color}/10 rounded-full border border-${edu.color}/30">
                                            <svg class="w-4 h-4 text-${edu.color.replace('-500', '-400')}" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span class="text-${edu.color.replace('-500', '-400')} text-sm font-semibold">Featured</span>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <!-- Description -->
                                <p class="text-text-secondary leading-relaxed mb-6">
                                    ${edu.description}
                                </p>
                                
                                ${edu.highlights && edu.highlights.length > 0 ? `
                                    <!-- Highlights -->
                                    <div class="mb-6 grid md:grid-cols-2 gap-3">
                                        ${edu.highlights.map(highlight => `
                                            <div class="flex items-start gap-3 p-3 bg-dark-light/50 rounded-xl">
                                                <div class="w-6 h-6 rounded-full bg-${edu.color}/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg class="w-3.5 h-3.5 text-${edu.color.replace('-500', '-400')}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                </div>
                                                <span class="text-text-secondary text-sm">${highlight}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                
                                <!-- Skills Learned -->
                                <div>
                                    <p class="text-white font-semibold mb-3 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-${edu.color.replace('-500', '-400')}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                                        </svg>
                                        Skills yang dipelajari
                                    </p>
                                    <div class="flex flex-wrap gap-2">
                                        ${edu.skills.map(skill => `
                                            <span class="px-3 py-1.5 bg-dark-light rounded-lg text-sm text-text-secondary border border-white/5 hover:border-${edu.color}/30 hover:text-${edu.color.replace('-500', '-400')} transition-all duration-300 flex items-center gap-2">
                                                <i class="${this.getTechIcon(skill)}" style="color: ${this.getTechColor(skill)}"></i>
                                                ${skill}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${edu.certificate ? `
                                    <!-- Certificate Link -->
                                    <div class="mt-6 pt-6 border-t border-white/5">
                                        <a href="${edu.certificate}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-${edu.color}/10 border border-${edu.color}/30 rounded-full text-${edu.color.replace('-500', '-400')} hover:bg-${edu.color} hover:text-dark transition-all duration-300 font-semibold text-sm">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                            </svg>
                                            Lihat Sertifikat
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ========================================
    // SOCIAL
    // ========================================
    renderSocial() {
        const { social, profile } = this.data;
        
        // Update social links
        this.setAttr('.social-github', 'href', social.github);
        this.setAttr('.social-linkedin', 'href', social.linkedin);
        this.setAttr('.social-instagram', 'href', social.instagram);
        if (social.discord) this.setAttr('.social-discord', 'href', social.discord);
        
        // LinkedIn view link
        this.setAttr('.view-linkedin', 'href', social.linkedin);
        
        // GitHub view link
        this.setAttr('.view-github', 'href', social.github);
    }

    // ========================================
    // HIRE PLATFORMS
    // ========================================
    renderHirePlatforms() {
        const { hirePlatforms } = this.data;
        if (!hirePlatforms) return;

        const container = document.getElementById('hire-platforms');
        if (!container) return;

        // Filter only active platforms
        const activePlatforms = hirePlatforms.filter(platform => platform.active !== false);

        const platformIcons = {
            upwork: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/></svg>`,
            freelancer: `<img src="assets/img/freelancer-logo.png" alt="Freelancer" class="w-8 h-8 object-contain">`,
            fastwork: `<img src="assets/img/fastwork-logo.png" alt="Fastwork" class="w-8 h-8 object-contain">`,
            sribulancer: `<img src="assets/img/sribulancer-logo.png" alt="Sribulancer" class="w-8 h-8 object-contain">`
        };

        container.innerHTML = activePlatforms.map(platform => `
            <a href="${platform.url}" target="_blank" rel="noopener noreferrer" 
               class="hire-card group relative p-6 bg-dark-light rounded-2xl border border-white/5 hover:border-[${platform.color}]/50 transition-all duration-500 hover:-translate-y-2 text-center overflow-hidden w-full sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] min-w-[200px]">
                <!-- Background glow -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" style="background: radial-gradient(circle at center, ${platform.color}, transparent 70%);"></div>
                
                <!-- Icon -->
                <div class="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300" style="background: ${platform.color}20; color: ${platform.color}">
                    ${platformIcons[platform.icon] || platformIcons.upwork}
                </div>
                
                <!-- Name -->
                <h3 class="font-display text-lg font-bold text-white group-hover:text-[${platform.color}] transition-colors duration-300">${platform.name}</h3>
                
                <!-- Description -->
                <p class="text-text-secondary text-sm mt-1">${platform.description}</p>
                
                <!-- Arrow -->
                <div class="mt-4 flex items-center justify-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300" style="color: ${platform.color}">
                    <span>Visit Profile</span>
                    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                </div>
            </a>
        `).join('');
    }

    // ========================================
    // SEO
    // ========================================
    renderSEO() {
        const { seo } = this.data;
        
        document.title = seo.title;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', seo.description);
    }

    // ========================================
    // HELPERS
    // ========================================
    setText(selector, text) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    setHTML(selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
    }

    setAttr(selector, attr, value) {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute(attr, value);
    }
}

// Initialize content loader
const contentLoader = new ContentLoader();

// Export for use in other scripts
window.contentLoader = contentLoader;
