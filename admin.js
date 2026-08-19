/* ========================================
   CONTENT DASHBOARD
   Schema-driven editor for data.json.

   Edits are bound by path into a working copy of the loaded JSON,
   so any key not described in SCHEMA below is preserved untouched
   on export.
   ======================================== */

/* ---------- tiny DOM helper (values set as properties, never as HTML) ---------- */
function h(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else if (k in node && k !== 'list' && k !== 'form') node[k] = v;
        else node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
        if (c === null || c === undefined || c === false) continue;
        node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
}

/* ========================================
   SCHEMA
   type: text | textarea | number | bool | url | email | color | select
         | tags (string[]) | stringlist (string[], long entries)
         | object (nested fields) | objectlist (array of objects)
   suggest: offer a datalist of values already used elsewhere in the list
   nullable: empty input is written back as null instead of ""
   ======================================== */
const SCHEMA = [
    {
        key: 'profile', label: 'Profil', kind: 'object',
        desc: 'Identitas utama yang tampil di hero, about, dan meta situs.',
        fields: [
            { key: 'name', label: 'Nama lengkap', type: 'text', hint: 'Tampil sebagai judul besar di hero.' },
            { key: 'nickname', label: 'Nama panggilan', type: 'text' },
            { key: 'loaderText', label: 'Teks loader', type: 'text', hint: 'Teks intro sebelum situs tampil.' },
            { key: 'title', label: 'Jabatan', type: 'text' },
            { key: 'company', label: 'Perusahaan', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'location', label: 'Lokasi', type: 'text' },
            { key: 'tagline', label: 'Tagline', type: 'text' },
            { key: 'heroDescription', label: 'Deskripsi hero', type: 'textarea' },
            { key: 'bio', label: 'Bio (section about)', type: 'textarea' },
            { key: 'photo', label: 'Path foto', type: 'image', hint: 'Relatif ke root, mis. assets/img/photo_profile.png' },
            { key: 'resume', label: 'Path CV', type: 'text', hint: 'Relatif ke root, mis. assets/resume/CV.pdf' },
            { key: 'available_for_hire', label: 'Terbuka untuk kerja', type: 'bool' },
        ]
    },
    {
        key: 'stats', label: 'Statistik', kind: 'list', titleKey: 'label',
        desc: 'Angka ringkas di section about.',
        newItem: () => ({ value: 0, label: '' }),
        fields: [
            { key: 'value', label: 'Angka', type: 'number' },
            { key: 'label', label: 'Keterangan', type: 'text' },
        ]
    },
    {
        key: 'social', label: 'Social Media', kind: 'object',
        desc: 'Tautan yang muncul di section kontak dan footer.',
        fields: [
            { key: 'github', label: 'GitHub', type: 'url' },
            { key: 'linkedin', label: 'LinkedIn', type: 'url' },
            { key: 'instagram', label: 'Instagram', type: 'url' },
            { key: 'discord', label: 'Discord', type: 'url' },
        ]
    },
    {
        key: 'skills', label: 'Tech Stack', kind: 'list', titleKey: 'title',
        desc: 'Kelompok keahlian beserta teknologinya.',
        newItem: () => ({ id: '', title: '', icon: '', technologies: [] }),
        fields: [
            { key: 'id', label: 'ID', type: 'text', hint: 'Huruf kecil tanpa spasi, mis. frontend' },
            { key: 'title', label: 'Judul kelompok', type: 'text' },
            { key: 'icon', label: 'Ikon', type: 'text', hint: 'Kelas devicon, mis. devicon-react-original' },
            {
                key: 'technologies', label: 'Teknologi', type: 'objectlist', titleKey: 'name',
                newItem: () => ({ name: '', icon: '', color: '#ffffff' }),
                fields: [
                    { key: 'name', label: 'Nama', type: 'text' },
                    { key: 'icon', label: 'Ikon devicon', type: 'text' },
                    { key: 'color', label: 'Warna', type: 'color' },
                ]
            },
        ]
    },
    {
        key: 'portfolio', label: 'Portfolio', kind: 'list', titleKey: 'title', badgeKey: 'year',
        desc: 'Proyek yang tampil di grid portfolio.',
        newItem: () => ({
            id: 0, title: '', subtitle: '', description: '', image: '', category: [],
            type: '', year: String(new Date().getFullYear()), color: 'accent', logo: '',
            logoType: 'text', technologies: [], featured: false, links: { demo: null, github: null }
        }),
        fields: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'title', label: 'Judul', type: 'text' },
            { key: 'subtitle', label: 'Subjudul', type: 'text' },
            { key: 'description', label: 'Deskripsi', type: 'textarea' },
            { key: 'year', label: 'Tahun', type: 'text', suggest: true },
            { key: 'type', label: 'Tipe', type: 'text', suggest: true },
            { key: 'category', label: 'Kategori', type: 'tags', hint: 'Harus cocok dengan ID di Filter Portfolio.' },
            { key: 'technologies', label: 'Teknologi', type: 'tags' },
            { key: 'image', label: 'Path gambar', type: 'image' },
            { key: 'logo', label: 'Logo', type: 'image', hint: 'Teks logo, atau path gambar bila logoType = image.' },
            { key: 'logoType', label: 'Jenis logo', type: 'text', suggest: true },
            { key: 'color', label: 'Warna aksen', type: 'text', suggest: true, hint: 'Token warna, mis. accent atau blue-500.' },
            { key: 'featured', label: 'Tampilkan sebagai unggulan', type: 'bool' },
            {
                key: 'links', label: 'Tautan', type: 'object',
                fields: [
                    { key: 'demo', label: 'Demo / situs', type: 'url', nullable: true },
                    { key: 'github', label: 'Repo GitHub', type: 'url', nullable: true },
                ]
            },
        ]
    },
    {
        key: 'experience', label: 'Pengalaman Kerja', kind: 'list', titleKey: 'position', badgeKey: 'companyShort',
        desc: 'Riwayat pekerjaan di section experience.',
        newItem: () => ({
            id: 0, position: '', company: '', companyShort: '', logo: '', location: '',
            vendor: '', type: '', period: '', description: '', technologies: [],
            color: 'accent', isCurrent: false
        }),
        fields: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'position', label: 'Posisi', type: 'text' },
            { key: 'company', label: 'Perusahaan', type: 'text' },
            { key: 'companyShort', label: 'Singkatan perusahaan', type: 'text' },
            { key: 'vendor', label: 'Vendor / agensi', type: 'text', nullable: true },
            { key: 'type', label: 'Tipe kerja', type: 'text', suggest: true },
            {
                key: 'period', label: 'Periode', type: 'text',
                hint: 'Format wajib "Mon YYYY - Mon YYYY" atau "Mon YYYY - Present" — dipakai untuk menghitung durasi.'
            },
            { key: 'location', label: 'Lokasi', type: 'text' },
            { key: 'description', label: 'Deskripsi', type: 'textarea' },
            { key: 'technologies', label: 'Teknologi', type: 'tags' },
            { key: 'logo', label: 'Path logo', type: 'image' },
            { key: 'color', label: 'Warna aksen', type: 'text', suggest: true },
            { key: 'isCurrent', label: 'Pekerjaan saat ini', type: 'bool' },
        ]
    },
    {
        key: 'education', label: 'Pendidikan', kind: 'list', titleKey: 'institution', badgeKey: 'period',
        desc: 'Riwayat pendidikan dan bootcamp.',
        newItem: () => ({
            id: 0, type: 'bootcamp', institution: '', program: '', logo: '', logoText: '',
            period: '', location: '', description: '', skills: [], certificate: '',
            color: 'accent', featured: false, highlights: []
        }),
        fields: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'type', label: 'Tipe', type: 'text', suggest: true },
            { key: 'institution', label: 'Institusi', type: 'text' },
            { key: 'program', label: 'Program', type: 'text' },
            { key: 'period', label: 'Periode', type: 'text' },
            { key: 'location', label: 'Lokasi', type: 'text' },
            { key: 'description', label: 'Deskripsi', type: 'textarea' },
            { key: 'skills', label: 'Skill', type: 'tags' },
            { key: 'highlights', label: 'Poin penting', type: 'stringlist' },
            { key: 'logo', label: 'URL / path logo', type: 'image' },
            { key: 'logoText', label: 'Teks logo', type: 'text', hint: 'Dipakai bila gambar logo gagal dimuat.' },
            { key: 'certificate', label: 'Path sertifikat', type: 'text', nullable: true },
            { key: 'color', label: 'Warna aksen', type: 'text', suggest: true },
            { key: 'featured', label: 'Unggulan', type: 'bool' },
        ]
    },
    {
        key: 'hirePlatforms', label: 'Platform Hire', kind: 'list', titleKey: 'name',
        desc: 'Platform freelance di section hire.',
        newItem: () => ({ name: '', url: '', icon: '', color: '#00ff88', description: '', active: true }),
        fields: [
            { key: 'name', label: 'Nama platform', type: 'text' },
            { key: 'url', label: 'URL profil', type: 'url' },
            { key: 'icon', label: 'Ikon', type: 'text' },
            { key: 'color', label: 'Warna merek', type: 'color' },
            { key: 'description', label: 'Deskripsi', type: 'text' },
            { key: 'active', label: 'Aktif (tampilkan)', type: 'bool' },
        ]
    },
    {
        key: 'navigation', label: 'Navigasi Desktop', kind: 'list', titleKey: 'label',
        desc: 'Menu di navbar desktop.',
        newItem: () => ({ id: '', label: '', href: '#' }),
        fields: [
            { key: 'id', label: 'ID', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'href', label: 'Anchor', type: 'text', hint: 'Harus cocok dengan id section, mis. #about' },
        ]
    },
    {
        key: 'mobileNavigation', label: 'Navigasi Mobile', kind: 'list', titleKey: 'label',
        desc: 'Menu di overlay mobile.',
        newItem: () => ({ id: '', label: '', href: '#' }),
        fields: [
            { key: 'id', label: 'ID', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'href', label: 'Anchor', type: 'text' },
        ]
    },
    {
        key: 'portfolioFilters', label: 'Filter Portfolio', kind: 'list', titleKey: 'label',
        desc: 'Tombol filter di atas grid portfolio.',
        newItem: () => ({ id: '', label: '', icon: null }),
        fields: [
            { key: 'id', label: 'ID', type: 'text', hint: 'Dicocokkan dengan kategori proyek; "all" menampilkan semua.' },
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'icon', label: 'Ikon', type: 'text', nullable: true },
        ]
    },
    {
        key: 'seo', label: 'SEO & Meta', kind: 'object',
        desc: 'Metadata untuk mesin pencari dan preview social media.',
        fields: [
            { key: 'title', label: 'Judul halaman', type: 'text' },
            { key: 'titleTemplate', label: 'Template judul', type: 'text', hint: '%s diganti judul halaman.' },
            { key: 'description', label: 'Deskripsi meta', type: 'textarea', hint: 'Idealnya 150–160 karakter.' },
            { key: 'keywords', label: 'Kata kunci', type: 'tags' },
            { key: 'author', label: 'Penulis', type: 'text' },
            { key: 'siteUrl', label: 'URL situs', type: 'url' },
            { key: 'ogImage', label: 'URL gambar OG', type: 'image' },
            { key: 'twitterHandle', label: 'Handle Twitter/X', type: 'text' },
            { key: 'locale', label: 'Locale', type: 'text' },
            { key: 'type', label: 'Tipe OG', type: 'text' },
        ]
    },
    {
        key: 'footer', label: 'Footer', kind: 'object',
        desc: 'Baris penutup di bagian bawah situs.',
        fields: [
            { key: 'copyright', label: 'Nama copyright', type: 'text' },
            { key: 'year', label: 'Tahun', type: 'number' },
            { key: 'tagline', label: 'Tagline', type: 'text' },
        ]
    },
];

/* ========================================
   STATE
   ======================================== */
const state = {
    data: null,          // working copy
    originalText: '',    // pristine JSON text, for reset + dirty check
    active: SCHEMA[0].key,
    open: {},            // sectionKey -> Set of open card indices
};

const $ = id => document.getElementById(id);

// Debug hook: inspect the working copy from the browser console.
window.__probe = () => state.data;

/* ---------- path get/set (numeric segments index into arrays) ---------- */
const getPath = (path) => path.reduce((o, k) => (o === null || o === undefined ? o : o[k]), state.data);
function setPath(path, value) {
    let node = state.data;
    for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
    node[path[path.length - 1]] = value;
    markDirty();
}

/* ========================================
   STATUS / DIRTY
   ======================================== */
// Trailing newline keeps git from flagging "no newline at end of file".
function currentText() { return JSON.stringify(state.data, null, 2) + '\n'; }
function isDirty() { return currentText() !== state.originalText; }

function markDirty() {
    const dirty = isDirty();
    const pill = $('status');
    pill.className = 'status ' + (dirty ? 'dirty' : 'saved');
    $('status-text').textContent = dirty ? 'ada perubahan belum diunduh' : 'tersimpan';
    if ($('drawer').classList.contains('open')) renderJson();
}

window.addEventListener('beforeunload', (e) => {
    if (state.data && isDirty()) { e.preventDefault(); e.returnValue = ''; }
});

/* ========================================
   FIELD RENDERERS
   ======================================== */
function labelFor(f) {
    return h('label', { text: f.label });
}

/* Short controls pair up in a two-column grid; long text and collections take a full row. */
const isWideField = f => ['textarea', 'tags', 'stringlist', 'object', 'objectlist'].includes(f.type);

function renderFieldsInto(container, fields, basePath, ctx) {
    const grid = h('div', { class: 'grid2' });
    for (const f of fields.filter(f => !isWideField(f))) {
        grid.append(renderField(f, [...basePath, f.key], ctx));
    }
    if (grid.children.length) container.append(grid);
    for (const f of fields.filter(isWideField)) {
        container.append(renderField(f, [...basePath, f.key], ctx));
    }
}

// Always returns a node: native append() would stringify a null into the text "null".
function fieldHint(f) {
    return f.hint ? h('div', { class: 'hint', text: f.hint }) : document.createDocumentFragment();
}

/* distinct values already used at this key across a list — powers `suggest` */
function suggestions(sectionKey, fieldKey) {
    const arr = state.data[sectionKey];
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.map(it => it && it[fieldKey]).filter(v => typeof v === 'string' && v.trim()))].sort();
}

function renderField(f, path, ctx) {
    const value = getPath(path);
    const wrap = h('div', { class: 'field' });

    /* --- nested object --- */
    if (f.type === 'object') {
        const box = h('div', { class: 'subsection' }, h('h4', { text: f.label }));
        if (getPath(path) === null || getPath(path) === undefined) setPath(path, {});
        renderFieldsInto(box, f.fields, path, ctx);
        return box;
    }

    /* --- nested array of objects --- */
    if (f.type === 'objectlist') {
        const box = h('div', { class: 'subsection' });
        const head = h('h4', { text: `${f.label} (${(value || []).length})` });
        box.append(h('div', { class: 'card-head', style: 'padding:0;cursor:default;margin-bottom:12px' },
            head,
            h('button', {
                class: 'btn btn-sm', text: '+ Tambah',
                onclick: () => { (getPath(path) || []).push(f.newItem()); markDirty(); renderMain(); }
            })
        ));
        (value || []).forEach((item, i) => box.append(renderCard(f, [...path, i], i, ctx)));
        if (!(value || []).length) box.append(h('div', { class: 'empty', text: 'Belum ada item.' }));
        return box;
    }

    wrap.append(labelFor(f));

    /* --- boolean toggle --- */
    if (f.type === 'bool') {
        const input = h('input', {
            type: 'checkbox', checked: !!value,
            onchange: e => setPath(path, e.target.checked)
        });
        wrap.replaceChildren(h('label', { class: 'check' }, input, h('span', { text: f.label })), fieldHint(f));
        return wrap;
    }

    /* --- tags: string[] --- */
    if (f.type === 'tags') {
        if (!Array.isArray(getPath(path))) setPath(path, []);
        const box = h('div', { class: 'tags' });
        const redraw = () => {
            const list = getPath(path);
            box.replaceChildren(
                ...list.map((t, i) => h('span', { class: 'tag' }, String(t),
                    h('button', {
                        type: 'button', text: '×', title: 'Hapus',
                        onclick: () => { list.splice(i, 1); markDirty(); redraw(); }
                    })
                )),
                h('input', {
                    type: 'text', placeholder: 'Ketik lalu Enter…',
                    onkeydown: e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = e.target.value.trim();
                            if (v) { list.push(v); markDirty(); redraw(); box.querySelector('input').focus(); }
                        } else if (e.key === 'Backspace' && !e.target.value && list.length) {
                            list.pop(); markDirty(); redraw(); box.querySelector('input').focus();
                        }
                    }
                })
            );
        };
        redraw();
        wrap.append(box, fieldHint(f));
        return wrap;
    }

    /* --- stringlist: string[] with longer entries --- */
    if (f.type === 'stringlist') {
        if (!Array.isArray(getPath(path))) setPath(path, []);
        const box = h('div');
        const redraw = () => {
            const list = getPath(path);
            box.replaceChildren(
                ...list.map((t, i) => h('div', { class: 'slist-row' },
                    h('textarea', {
                        class: 'control', value: String(t ?? ''), rows: 2,
                        style: 'min-height:52px',
                        oninput: e => { list[i] = e.target.value; markDirty(); }
                    }),
                    h('button', {
                        class: 'btn-icon danger', text: '🗑', title: 'Hapus',
                        onclick: () => { list.splice(i, 1); markDirty(); redraw(); }
                    })
                )),
                h('button', {
                    class: 'btn btn-sm', text: '+ Tambah baris',
                    onclick: () => { list.push(''); markDirty(); redraw(); }
                })
            );
        };
        redraw();
        wrap.append(box, fieldHint(f));
        return wrap;
    }

    /* --- image: path input + live thumbnail --- */
    if (f.type === 'image') {
        // A value only gets fetched if it actually looks like an image reference.
        // portfolio[].logo, for instance, holds plain text when logoType is "text".
        const looksLikeImage = v =>
            /^(https?:\/\/|\/\/|data:image\/)/i.test(v) ||
            /\.(png|jpe?g|gif|svg|webp|avif|ico)(\?.*)?$/i.test(v);

        const frame = h('div', { class: 'img-frame empty' });
        const meta = h('div', { class: 'img-meta' });
        const preview = h('div', { class: 'img-preview' }, frame, meta);

        const update = (raw) => {
            const v = (raw || '').trim();
            frame.className = 'img-frame empty';
            frame.replaceChildren(h('span', { class: 'ph', text: '🖼' }));
            preview.classList.remove('text-only');

            if (!v) {
                meta.replaceChildren(h('div', { text: 'Belum ada gambar.' }));
                return;
            }
            if (!looksLikeImage(v)) {
                // Plain text (e.g. a portfolio logo when logoType is "text") — an empty
                // frame would read as a broken image, so drop it and keep just the note.
                preview.classList.add('text-only');
                meta.replaceChildren(h('div', { text: 'Bukan path gambar — dipakai sebagai teks.' }));
                return;
            }

            frame.classList.add('loading');
            meta.replaceChildren(h('div', { text: 'Memuat…' }));

            // Handlers must be attached before src, or a cached image can fire before we listen.
            const img = h('img', { alt: '' });
            img.onload = () => {
                frame.className = 'img-frame';
                frame.replaceChildren(img);
                meta.replaceChildren(
                    h('div', { class: 'ok', text: `${img.naturalWidth} × ${img.naturalHeight} px` }),
                    h('div', { text: v }),
                    h('a', { href: v, target: '_blank', rel: 'noopener noreferrer', text: 'buka ukuran penuh ↗' })
                );
            };
            img.onerror = () => {
                frame.className = 'img-frame empty';
                frame.replaceChildren(h('span', { class: 'ph', text: '⚠' }));
                meta.replaceChildren(
                    h('div', { class: 'err', text: 'Gagal dimuat — file tidak ditemukan.' }),
                    h('div', { text: v })
                );
            };
            img.src = v;
        };

        let timer;
        const input = h('input', {
            class: 'control', type: 'text', value: value ?? '',
            placeholder: f.placeholder || '',
            oninput: e => {
                const v = e.target.value;
                setPath(path, f.nullable && v.trim() === '' ? null : v);
                if (ctx && ctx.onTitleChange && f.key === ctx.titleKey) ctx.onTitleChange(v);
                clearTimeout(timer);
                timer = setTimeout(() => update(v), 350);   // debounce so typing doesn't spam requests
            }
        });

        update(value);
        wrap.append(input, preview, fieldHint(f));
        return wrap;
    }

    /* --- color: swatch + hex text --- */
    if (f.type === 'color') {
        const hex = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff';
        const text = h('input', {
            class: 'control', type: 'text', value: value ?? '',
            oninput: e => { setPath(path, e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) picker.value = e.target.value; }
        });
        const picker = h('input', {
            type: 'color', value: hex,
            oninput: e => { text.value = e.target.value; setPath(path, e.target.value); }
        });
        wrap.append(h('div', { class: 'color-row' }, picker, text), fieldHint(f));
        return wrap;
    }

    /* --- textarea --- */
    if (f.type === 'textarea') {
        wrap.append(h('textarea', {
            class: 'control', value: value ?? '', placeholder: f.placeholder || '',
            oninput: e => setPath(path, e.target.value)
        }), fieldHint(f));
        return wrap;
    }

    /* --- number --- */
    if (f.type === 'number') {
        wrap.append(h('input', {
            class: 'control', type: 'number', value: value ?? '',
            oninput: e => setPath(path, e.target.value === '' ? null : Number(e.target.value))
        }), fieldHint(f));
        return wrap;
    }

    /* --- text / url / email --- */
    const input = h('input', {
        class: 'control',
        type: f.type === 'email' ? 'email' : 'text',
        value: value ?? '',
        placeholder: f.placeholder || (f.nullable ? 'kosongkan untuk null' : ''),
        oninput: e => {
            const v = e.target.value;
            setPath(path, f.nullable && v.trim() === '' ? null : v);
            if (ctx && ctx.onTitleChange && f.key === ctx.titleKey) ctx.onTitleChange(v);
            if (ctx && ctx.onBadgeChange && f.key === ctx.badgeKey) ctx.onBadgeChange(v);
        }
    });

    if (f.suggest && ctx && ctx.sectionKey) {
        const listId = `dl-${ctx.sectionKey}-${f.key}`;
        input.setAttribute('list', listId);
        wrap.append(input, h('datalist', { id: listId },
            ...suggestions(ctx.sectionKey, f.key).map(v => h('option', { value: v }))));
    } else {
        wrap.append(input);
    }

    wrap.append(fieldHint(f));
    return wrap;
}

/* ========================================
   ARRAY ITEM CARD
   ======================================== */
function renderCard(def, path, index, parentCtx) {
    const item = getPath(path);
    const sectionKey = (parentCtx && parentCtx.sectionKey) || def.key;
    const cardKey = path.join('.');
    const isOpen = state.open[cardKey] === true;

    const titleEl = h('span', { class: 'title', text: String(item?.[def.titleKey] || '(tanpa judul)') });
    const badgeEl = def.badgeKey && item?.[def.badgeKey]
        ? h('span', { class: 'badge', text: String(item[def.badgeKey]) }) : null;

    const card = h('div', { class: 'card' + (isOpen ? ' open' : '') });

    const list = getPath(path.slice(0, -1));
    const move = (delta) => {
        const to = index + delta;
        if (to < 0 || to >= list.length) return;
        [list[index], list[to]] = [list[to], list[index]];
        markDirty(); renderMain();
    };

    const head = h('div', { class: 'card-head', onclick: (e) => {
        if (e.target.closest('.card-actions')) return;
        state.open[cardKey] = !isOpen;
        card.classList.toggle('open');
    }},
        h('span', { class: 'chev', text: '▶' }),
        h('span', { class: 'idx', text: `#${index + 1}` }),
        titleEl,
        badgeEl,
        h('div', { class: 'card-actions' },
            h('button', { class: 'btn-icon', text: '↑', title: 'Naikkan', onclick: () => move(-1) }),
            h('button', { class: 'btn-icon', text: '↓', title: 'Turunkan', onclick: () => move(1) }),
            h('button', {
                class: 'btn-icon', text: '⧉', title: 'Duplikat',
                onclick: () => {
                    list.splice(index + 1, 0, JSON.parse(JSON.stringify(item)));
                    markDirty(); renderMain();
                }
            }),
            h('button', {
                class: 'btn-icon danger', text: '🗑', title: 'Hapus',
                onclick: () => {
                    if (!confirm(`Hapus "${item?.[def.titleKey] || 'item ini'}"?`)) return;
                    list.splice(index, 1);
                    delete state.open[cardKey];
                    markDirty(); renderMain();
                }
            })
        )
    );

    const ctx = {
        sectionKey,
        titleKey: def.titleKey,
        badgeKey: def.badgeKey,
        onTitleChange: v => { titleEl.textContent = v || '(tanpa judul)'; },
        onBadgeChange: v => { if (badgeEl) badgeEl.textContent = v || ''; },
    };

    const body = h('div', { class: 'card-body' });
    renderFieldsInto(body, def.fields, path, ctx);

    card.append(head, body);
    return card;
}

/* ========================================
   MAIN RENDER
   ======================================== */
function renderSidebar() {
    const nav = $('sidebar');
    nav.replaceChildren(h('div', { class: 'side-label', text: 'Section' }));
    for (const s of SCHEMA) {
        const val = state.data[s.key];
        const count = Array.isArray(val) ? val.length : null;
        nav.append(h('button', {
            class: 'side-item' + (s.key === state.active ? ' active' : ''),
            onclick: () => { state.active = s.key; renderSidebar(); renderMain(); $('main').scrollTop = 0; }
        },
            h('span', { text: s.label }),
            count !== null ? h('span', { class: 'count', text: String(count) }) : null
        ));
    }
}

function renderMain() {
    const def = SCHEMA.find(s => s.key === state.active);
    const main = $('main');
    const head = h('div', { class: 'main-head' },
        h('h1', { text: def.label }),
        def.desc ? h('p', { text: def.desc }) : null
    );

    // The sidebar is hidden under 760px, so mobile needs its own section switcher.
    const picker = h('div', { class: 'mobile-sections' },
        h('label', { class: 'field' },
            h('select', {
                class: 'control',
                value: def.key,
                onchange: e => { state.active = e.target.value; renderSidebar(); renderMain(); $('main').scrollTop = 0; }
            }, ...SCHEMA.map(s => h('option', {
                value: s.key,
                selected: s.key === def.key,
                text: Array.isArray(state.data[s.key]) ? `${s.label} (${state.data[s.key].length})` : s.label
            })))
        )
    );

    main.replaceChildren(picker, head);

    if (def.kind === 'object') {
        if (!state.data[def.key] || typeof state.data[def.key] !== 'object') state.data[def.key] = {};
        renderFieldsInto(main, def.fields, [def.key], { sectionKey: def.key });
        return;
    }

    /* list section */
    if (!Array.isArray(state.data[def.key])) state.data[def.key] = [];
    const arr = state.data[def.key];

    main.append(h('div', { style: 'display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap' },
        h('button', {
            class: 'btn btn-primary btn-sm', text: '+ Tambah item',
            onclick: () => {
                arr.push(def.newItem());
                state.open[`${def.key}.${arr.length - 1}`] = true;
                markDirty(); renderSidebar(); renderMain();
            }
        }),
        arr.length > 1 ? h('button', {
            class: 'btn btn-sm', text: 'Buka semua',
            onclick: () => { arr.forEach((_, i) => state.open[`${def.key}.${i}`] = true); renderMain(); }
        }) : null,
        arr.length > 1 ? h('button', {
            class: 'btn btn-sm', text: 'Tutup semua',
            onclick: () => { arr.forEach((_, i) => state.open[`${def.key}.${i}`] = false); renderMain(); }
        }) : null
    ));

    if (!arr.length) {
        main.append(h('div', { class: 'empty', text: 'Belum ada item. Klik "Tambah item" untuk mulai.' }));
        return;
    }
    arr.forEach((_, i) => main.append(renderCard(def, [def.key, i], i, { sectionKey: def.key })));
}

/* ========================================
   EXPORT
   ======================================== */
function download() {
    const text = currentText();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: 'data.json' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.originalText = text;   // treat an export as the new baseline
    markDirty();
    toast('data.json diunduh. Timpa file di root project, lalu commit & push.');
}

async function copyJson() {
    const text = currentText();
    try {
        await navigator.clipboard.writeText(text);
        toast('JSON disalin ke clipboard.');
    } catch {
        // Clipboard API needs a secure context; fall back to a manual selection.
        const ta = h('textarea', { value: text, style: 'position:fixed;opacity:0' });
        document.body.append(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        toast(ok ? 'JSON disalin ke clipboard.' : 'Gagal menyalin — buka panel JSON lalu salin manual.', !ok);
    }
}

function renderJson() {
    const text = currentText();
    $('json-preview').textContent = text;
    $('json-size').textContent = `${(new Blob([text]).size / 1024).toFixed(1)} KB`;
}

function toast(msg, isError) {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast show' + (isError ? ' err' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.className = 'toast' + (isError ? ' err' : ''), 3600);
}

/* ========================================
   BOOT
   ======================================== */
function start(json) {
    state.data = json;
    state.originalText = currentText();   // same serializer as export, so boot is never "dirty"
    $('gate').classList.add('hidden');
    renderSidebar();
    renderMain();
    markDirty();
}

async function load() {
    const msg = $('gate-msg');
    try {
        const res = await fetch('data.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        start(await res.json());
    } catch (err) {
        msg.textContent = `Tidak bisa memuat data.json otomatis (${err.message}). ` +
            `Jalankan lewat server lokal, atau pilih file-nya manual.`;
        $('gate-actions').style.display = 'flex';
    }
}

$('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        start(JSON.parse(await file.text()));
    } catch (err) {
        $('gate-msg').textContent = `File bukan JSON yang valid: ${err.message}`;
    }
});
$('gate-retry').addEventListener('click', load);

$('btn-download').addEventListener('click', download);
$('btn-copy').addEventListener('click', copyJson);
$('btn-reset').addEventListener('click', () => {
    if (!isDirty()) return toast('Belum ada perubahan.');
    if (!confirm('Buang semua perubahan dan kembali ke data terakhir dimuat?')) return;
    state.data = JSON.parse(state.originalText);
    state.open = {};
    renderSidebar(); renderMain(); markDirty();
    toast('Perubahan dibuang.');
});

const drawer = $('drawer'), backdrop = $('backdrop');
const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); };
$('btn-json').addEventListener('click', () => {
    renderJson();
    drawer.classList.add('open'); backdrop.classList.add('open');
});
$('drawer-close').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

load();
