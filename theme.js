// Light / dark theme. Loads in <head>, before style.css, so the page never flashes the wrong theme.
// A saved choice wins; otherwise the site opens dark. The toggle sits at the end of the nav.
(() => {
	const root = document.documentElement;
	const colors = { light: '#fbf8f2', dark: '#171513' };

	let saved = null;
	try { saved = localStorage.getItem('theme'); } catch (e) {}

	const apply = (theme) => {
		root.dataset.theme = theme;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
		const toggle = document.querySelector('.theme-toggle');
		if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
	};

	apply(saved === 'light' ? 'light' : 'dark');

	addEventListener('DOMContentLoaded', () => {
		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'theme-toggle';
		toggle.addEventListener('click', () => {
			saved = root.dataset.theme === 'dark' ? 'light' : 'dark';
			try { localStorage.setItem('theme', saved); } catch (e) {}
			apply(saved);
		});
		(document.querySelector('.nav') || document.body).append(toggle);
		apply(root.dataset.theme);
	});
})();
