// Fade elements in as they scroll into view, staggered within each batch.
// Pages add the "js" class to <html> early so items start hidden only when this runs.
const items = document.querySelectorAll('.work-item, .reveal');
document.querySelectorAll('.reveal-group').forEach((group) => {
	[...group.children].forEach((child, i) => child.style.setProperty('--i', i));
});
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const io = new IntersectionObserver((entries) => {
		entries.filter((e) => e.isIntersecting).forEach((e, i) => {
			e.target.style.setProperty('--delay', `${i * 90}ms`);
			e.target.classList.add('is-visible');
			io.unobserve(e.target);
		});
	}, { rootMargin: '0px 0px -10% 0px' });
	items.forEach((el) => io.observe(el));
} else {
	items.forEach((el) => el.classList.add('is-visible'));
}
