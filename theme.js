// Light / dark theme. Loads in <head>, before style.css, so the page never flashes the wrong theme.
// A saved choice wins; otherwise it follows the system setting. The toggle sits in the bottom-right corner.
(() => {
	const root = document.documentElement;
	const system = matchMedia('(prefers-color-scheme: dark)');
	const colors = { light: '#fbf8f2', dark: '#171513' };

	let saved = null;
	try { saved = localStorage.getItem('theme'); } catch (e) {}

	const apply = (theme) => {
		root.dataset.theme = theme;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
		const toggle = document.querySelector('.theme-toggle');
		if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
	};

	apply(saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light');

	// Until someone picks a theme, keep following the system.
	system.addEventListener('change', (e) => { if (!saved) apply(e.matches ? 'dark' : 'light'); });

	addEventListener('DOMContentLoaded', () => {
		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'theme-toggle';
		toggle.addEventListener('click', () => {
			saved = root.dataset.theme === 'dark' ? 'light' : 'dark';
			try { localStorage.setItem('theme', saved); } catch (e) {}
			apply(saved);
		});
		document.body.append(toggle);
		apply(root.dataset.theme);
	});
})();
