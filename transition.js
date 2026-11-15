// Page transition. A link to another page of the site slides a panel up over this one, with the logo; the next page
// loads already covered, then the panel fades off it. Loads in <head>, so an arriving page never flashes
// uncovered. Skipped with reduced motion, new tabs, and links that leave the site.
(() => {
	const root = document.documentElement;
	const key = 'page-transition';
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const page = (path) => path.replace(/index\.html$/, '');

	// Arriving from a transition: start covered (style.css draws the cover on .is-arriving).
	try {
		const pending = JSON.parse(sessionStorage.getItem(key));
		sessionStorage.removeItem(key);
		if (pending && pending.to === page(location.pathname) && Date.now() - pending.at < 10000 && !reduced.matches) {
			root.classList.add('is-arriving');
		}
	} catch (e) {}

	const panel = (state) => {
		const el = document.createElement('div');
		el.className = `page-panel ${state}`;
		el.setAttribute('aria-hidden', 'true');
		document.body.append(el);
		return el;
	};
	// Runs once the panel's own animation ends (the logo animates too), or after a fallback.
	const after = (el, name, done) => {
		let finished = false;
		const finish = () => { if (!finished) { finished = true; done(); } };
		el.addEventListener('animationend', (e) => { if (e.animationName === name) finish(); });
		setTimeout(finish, 1300);
	};

	addEventListener('DOMContentLoaded', () => {
		if (!root.classList.contains('is-arriving')) return;
		const el = panel('is-covered');
		root.classList.remove('is-arriving');
		// Let the covered panel paint before it moves.
		requestAnimationFrame(() => requestAnimationFrame(() => {
			el.classList.replace('is-covered', 'is-revealing');
			after(el, 'page-panel-reveal', () => el.remove());
		}));
	});

	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduced.matches) return;
		const link = e.target.closest('a[href]');
		if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
		const url = new URL(link.href, location.href);
		if (url.protocol !== location.protocol || url.host !== location.host) return;
		if (!/(\.html|\/)$/.test(url.pathname) || page(url.pathname) === page(location.pathname)) return;
		try { sessionStorage.setItem(key, JSON.stringify({ to: page(url.pathname), at: Date.now() })); } catch (err) { return; }
		e.preventDefault();
		const el = panel('is-covering');
		after(el, 'page-panel-cover', () => location.assign(url.href));
	});

	// Back/forward can restore this page from memory with the panel still over it.
	addEventListener('pageshow', (e) => {
		if (e.persisted) document.querySelectorAll('.page-panel').forEach((el) => el.remove());
	});
})();
