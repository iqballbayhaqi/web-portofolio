/* ========================================
   PROJECT DETAIL PAGE
   Renders one portfolio item from data.json, picked by ?p=<slug>.
   Reuses ContentLoader (content.js) for data fetching, slugs and tech icons.
   ======================================== */

(() => {
    const loader = window.contentLoader;
    const root = document.getElementById('project-detail');
    const SITE = 'https://balee.web.id/';

    const esc = value => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // "blue-500" -> "blue-400" for text on dark surfaces; "accent" stays as is.
    const tone = color => (color || 'accent').replace('-500', '-400');

    // Same order as the grid on index.html: featured first, then newest.
    const sortProjects = list => [...list].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return parseInt(b.year) - parseInt(a.year);
    });

    const paragraphs = text => String(text || '')
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
        .join('');

    const icons = {
        external: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
        github: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        check: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
        left: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>',
        right: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>'
    };

    /* ---------- pieces ---------- */

    const media = project => project.image
        ? `<button type="button" class="pd-zoom block w-full text-left" data-src="${esc(project.image)}" data-alt="${esc(project.title)}" aria-label="Perbesar screenshot ${esc(project.title)}">
               <img src="${esc(project.image)}" alt="Screenshot ${esc(project.title)}" class="w-full h-full object-cover object-top" width="1280" height="720">
           </button>`
        : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-${project.color}/20 via-${project.color}/10 to-dark">
               <div class="text-center">${loader.renderProjectLogo(project)}
                   <span class="font-mono text-xs text-text-secondary px-3 py-1 bg-dark/50 rounded-full">${esc(project.subtitle)}</span>
               </div>
           </div>`;

    const linkButtons = project => {
        const out = [];
        if (project.links?.demo) {
            out.push(`<a href="${esc(project.links.demo)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark font-semibold rounded-full hover:scale-105 transition-transform">
                ${icons.external} Kunjungi situs</a>`);
        }
        if (project.links?.github) {
            out.push(`<a href="${esc(project.links.github)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 border border-text-secondary/30 rounded-full hover:border-accent hover:text-accent transition-colors">
                ${icons.github} Source code</a>`);
        }
        return out.join('');
    };

    const infoRow = (label, value) => value ? `
        <div class="flex justify-between gap-4 py-3 border-b border-white/5 last:border-0">
            <dt class="text-text-secondary text-sm">${label}</dt>
            <dd class="text-sm font-medium text-right">${value}</dd>
        </div>` : '';

    const techChips = project => (project.technologies || []).map(tech => `
        <span class="px-3 py-1.5 bg-dark rounded-lg text-sm text-text-secondary border border-white/5 flex items-center gap-2">
            <i class="${loader.getTechIcon(tech)}" style="color: ${loader.getTechColor(tech)}"></i>${esc(tech)}
        </span>`).join('');

    const miniCard = project => `
        <a href="${loader.projectUrl(project)}" class="group block bg-dark-light rounded-2xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1">
            <div class="aspect-video overflow-hidden relative">
                ${project.image
                    ? `<img src="${esc(project.image)}" alt="" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">`
                    : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-${project.color}/20 to-dark">${loader.renderProjectLogo(project)}</div>`}
            </div>
            <div class="p-5">
                <p class="font-mono text-xs text-text-secondary mb-1">${esc(project.type)} · ${esc(project.year)}</p>
                <h3 class="font-display text-lg font-bold group-hover:text-accent transition-colors">${esc(project.title)}</h3>
                <p class="text-text-secondary text-sm mt-1">${esc(project.subtitle)}</p>
            </div>
        </a>`;

    /* ---------- page ---------- */

    function renderProject(project, data) {
        const all = sortProjects(data.portfolio || []);
        const index = all.findIndex(p => p === project);
        const prev = all[(index - 1 + all.length) % all.length];
        const next = all[(index + 1) % all.length];

        const filterLabels = Object.fromEntries((data.portfolioFilters || []).map(f => [f.id, f.label]));
        const categories = (project.category || []).map(c => filterLabels[c] || c);

        // Related: shares a category, closest in year first; fill up with the rest.
        const shared = p => (p.category || []).some(c => (project.category || []).includes(c));
        const others = all.filter(p => p !== project);
        const related = [...others.filter(shared), ...others.filter(p => !shared(p))].slice(0, 3);

        const gallery = (project.gallery || []).filter(Boolean);
        const features = (project.features || []).filter(Boolean);
        const accentText = `text-${tone(project.color)}`;

        root.innerHTML = `
            <nav aria-label="Breadcrumb" class="pd-fade mb-8 font-mono text-xs text-text-secondary">
                <ol class="flex flex-wrap items-center gap-2">
                    <li><a href="index.html" class="hover:text-accent">Home</a></li>
                    <li aria-hidden="true">/</li>
                    <li><a href="index.html#portfolio" class="hover:text-accent">Portfolio</a></li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" class="text-text-primary">${esc(project.title)}</li>
                </ol>
            </nav>

            <header class="pd-fade pd-fade-2 mb-10">
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <span class="px-2.5 py-1 bg-${project.color}/10 rounded text-xs ${accentText} font-mono">${esc(project.type)}</span>
                    <span class="px-2.5 py-1 bg-purple-500/10 rounded text-xs text-purple-400 font-mono">${esc(project.year)}</span>
                    ${project.featured ? '<span class="px-2.5 py-1 bg-accent/10 rounded text-xs text-accent font-mono">★ Featured</span>' : ''}
                </div>
                <h1 class="font-display text-4xl md:text-6xl font-bold leading-tight tracking-tight">${esc(project.title)}</h1>
                <p class="mt-3 text-lg md:text-xl ${accentText}">${esc(project.subtitle)}</p>
                <div class="mt-8 flex flex-wrap gap-3">${linkButtons(project)}</div>
            </header>

            <div class="pd-fade pd-fade-3 aspect-video rounded-2xl overflow-hidden border border-white/5 bg-dark-light mb-14">
                ${media(project)}
            </div>

            <div class="grid lg:grid-cols-3 gap-10 lg:gap-14">
                <article class="lg:col-span-2 min-w-0">
                    <p class="font-mono text-accent text-sm tracking-widest mb-4">// TENTANG PROYEK</p>
                    <div class="pd-prose text-text-secondary text-lg leading-relaxed">
                        ${paragraphs(project.longDescription || project.description)}
                    </div>

                    ${features.length ? `
                        <h2 class="font-display text-2xl font-bold mt-12 mb-5">Fitur &amp; kontribusi</h2>
                        <ul class="grid sm:grid-cols-2 gap-3">
                            ${features.map(f => `
                                <li class="flex items-start gap-3 p-4 bg-dark-light rounded-xl border border-white/5">
                                    <span class="w-6 h-6 rounded-full bg-${project.color}/20 ${accentText} flex items-center justify-center flex-shrink-0 mt-0.5">${icons.check}</span>
                                    <span class="text-text-secondary text-sm leading-relaxed">${esc(f)}</span>
                                </li>`).join('')}
                        </ul>` : ''}

                    ${gallery.length ? `
                        <h2 class="font-display text-2xl font-bold mt-12 mb-5">Galeri</h2>
                        <div class="grid sm:grid-cols-2 gap-4">
                            ${gallery.map((src, i) => `
                                <button type="button" class="pd-zoom block aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-accent/30 transition-colors" data-src="${esc(src)}" data-alt="${esc(project.title)} screenshot ${i + 1}" aria-label="Perbesar screenshot ${i + 1}">
                                    <img src="${esc(src)}" alt="${esc(project.title)} screenshot ${i + 1}" loading="lazy" class="w-full h-full object-cover">
                                </button>`).join('')}
                        </div>` : ''}
                </article>

                <aside class="space-y-6">
                    <div class="p-6 bg-dark-light rounded-2xl border border-white/5">
                        <h2 class="font-display text-lg font-bold mb-2">Info proyek</h2>
                        <dl>
                            ${infoRow('Peran', esc(project.role))}
                            ${infoRow('Tipe', esc(project.type))}
                            ${infoRow('Tahun', esc(project.year))}
                            ${infoRow('Kategori', esc(categories.join(', ')))}
                            ${infoRow('Situs', project.links?.demo ? `<a href="${esc(project.links.demo)}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline break-all">${esc(project.links.demo.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : '')}
                        </dl>
                    </div>
                    <div class="p-6 bg-dark-light rounded-2xl border border-white/5">
                        <h2 class="font-display text-lg font-bold mb-4">Tech stack</h2>
                        <div class="flex flex-wrap gap-2">${techChips(project)}</div>
                    </div>
                </aside>
            </div>

            ${all.length > 1 ? `
                <nav aria-label="Navigasi proyek" class="mt-20 grid sm:grid-cols-2 gap-4">
                    <a href="${loader.projectUrl(prev)}" class="group p-6 bg-dark-light rounded-2xl border border-white/5 hover:border-accent/30 transition-colors">
                        <span class="flex items-center gap-2 font-mono text-xs text-text-secondary">${icons.left} Sebelumnya</span>
                        <span class="block mt-2 font-display text-xl font-bold group-hover:text-accent transition-colors">${esc(prev.title)}</span>
                    </a>
                    <a href="${loader.projectUrl(next)}" class="group p-6 bg-dark-light rounded-2xl border border-white/5 hover:border-accent/30 transition-colors sm:text-right">
                        <span class="flex items-center gap-2 font-mono text-xs text-text-secondary sm:justify-end">Berikutnya ${icons.right}</span>
                        <span class="block mt-2 font-display text-xl font-bold group-hover:text-accent transition-colors">${esc(next.title)}</span>
                    </a>
                </nav>` : ''}

            ${related.length ? `
                <section class="mt-20" aria-labelledby="related-heading">
                    <div class="flex items-end justify-between gap-4 mb-8">
                        <h2 id="related-heading" class="font-display text-3xl font-bold">Proyek <span class="text-accent">lainnya</span></h2>
                        <a href="index.html#portfolio" class="text-sm text-text-secondary hover:text-accent flex items-center gap-2">Lihat semua ${icons.right}</a>
                    </div>
                    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">${related.map(miniCard).join('')}</div>
                </section>` : ''}
        `;

        updateMeta(project, data);
    }

    function renderNotFound(slug) {
        document.title = 'Proyek tidak ditemukan | Iqbal Baihaqi Abdullah';
        setMeta('meta[name="robots"]', 'noindex, follow');
        root.innerHTML = `
            <div class="py-24 text-center pd-fade">
                <p class="font-mono text-accent text-sm tracking-widest mb-4">// 404</p>
                <h1 class="font-display text-4xl md:text-5xl font-bold">Proyek tidak ditemukan</h1>
                <p class="mt-4 text-text-secondary">${slug ? `Tidak ada proyek dengan alamat <code class="font-mono text-text-primary">${esc(slug)}</code>.` : 'Alamat proyek tidak disertakan.'}</p>
                <a href="index.html#portfolio" class="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-accent text-dark font-semibold rounded-full">${icons.left} Kembali ke portfolio</a>
            </div>`;
    }

    function renderError() {
        root.innerHTML = `
            <div class="py-24 text-center">
                <h1 class="font-display text-3xl font-bold">Gagal memuat proyek</h1>
                <p class="mt-4 text-text-secondary">Periksa koneksi lalu muat ulang halaman.</p>
                <a href="index.html#portfolio" class="mt-8 inline-flex items-center gap-2 text-accent">${icons.left} Kembali ke portfolio</a>
            </div>`;
    }

    /* ---------- meta ---------- */

    function setMeta(selector, value, attr = 'content') {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute(attr, value);
    }

    function updateMeta(project, data) {
        const name = data.profile?.name || 'Iqbal Baihaqi Abdullah';
        const title = `${project.title} - ${project.subtitle} | ${name}`;
        const description = String(project.description || '').slice(0, 300);
        const url = new URL(loader.projectUrl(project), SITE).href;
        const image = new URL(project.image || data.profile?.photo || 'assets/img/photo_profile.png', SITE).href;

        document.title = title;
        for (const s of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) setMeta(s, title);
        for (const s of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) setMeta(s, description);
        for (const s of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) setMeta(s, image);
        setMeta('meta[property="og:url"]', url);
        setMeta('link[rel="canonical"]', url, 'href');

        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            headline: `${project.title} - ${project.subtitle}`,
            description: project.description,
            url,
            image,
            dateCreated: String(project.year),
            keywords: (project.technologies || []).join(', '),
            creator: { '@type': 'Person', '@id': `${SITE}#person`, name },
            ...(project.links?.demo ? { sameAs: project.links.demo } : {})
        });
        document.head.appendChild(ld);
    }

    /* ---------- lightbox ---------- */

    function initLightbox() {
        const box = document.getElementById('pd-lightbox');
        const img = document.getElementById('pd-lightbox-img');
        const closeBtn = document.getElementById('pd-lightbox-close');
        let opener = null;

        const close = () => {
            box.hidden = true;
            img.src = '';
            document.body.style.overflow = '';
            opener?.focus();
        };

        root.addEventListener('click', e => {
            const trigger = e.target.closest('.pd-zoom');
            if (!trigger) return;
            opener = trigger;
            img.src = trigger.dataset.src;
            img.alt = trigger.dataset.alt || '';
            box.hidden = false;
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        });
        closeBtn.addEventListener('click', close);
        box.addEventListener('click', e => { if (e.target === box) close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
    }

    /* ---------- boot ---------- */

    async function init() {
        initLightbox();
        const params = new URLSearchParams(location.search);
        const slug = (params.get('p') || params.get('id') || '').trim().toLowerCase();

        const data = await loader.fetchData();
        if (!data) return renderError();

        const project = (data.portfolio || []).find(p =>
            loader.projectSlug(p) === slug || String(p.id) === slug);

        if (!project) return renderNotFound(slug);
        renderProject(project, data);
        window.scrollTo(0, 0);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
