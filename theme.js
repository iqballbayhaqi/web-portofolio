// Run before styles load to prevent a flash of the wrong theme.
(() => {
    const root = document.documentElement;
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const modes = ['system', 'light', 'dark'];
    let preference = 'system';
    try {
        const saved = localStorage.getItem('portfolio-theme');
        if (modes.includes(saved)) preference = saved;
    } catch (_) { /* Storage may be disabled. */ }

    function apply() {
        const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
        root.dataset.theme = theme;
        root.dataset.themePreference = preference;
        root.style.colorScheme = theme;
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        const label = preference[0].toUpperCase() + preference.slice(1);
        const next = modes[(modes.indexOf(preference) + 1) % modes.length];
        document.getElementById('theme-label').textContent = label;
        document.getElementById('theme-icon').innerHTML = {
            system: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
            light: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
            dark: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>'
        }[preference];
        button.setAttribute('aria-label', `Tema: ${label}. Ganti ke ${next}`);
        button.title = `Tema: ${label}`;
    }
    apply();
    system.addEventListener('change', apply);
    window.addEventListener('storage', event => {
        if (event.key !== 'portfolio-theme' && event.key !== null) return;
        preference = modes.includes(event.newValue) ? event.newValue : 'system';
        apply();
    });
    document.addEventListener('DOMContentLoaded', () => {
        apply();
        document.getElementById('theme-toggle').addEventListener('click', () => {
            preference = modes[(modes.indexOf(preference) + 1) % modes.length];
            try { localStorage.setItem('portfolio-theme', preference); } catch (_) { }
            apply();
        });
    });
})();
