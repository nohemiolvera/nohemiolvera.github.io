// Slide the About photo strip sideways as the page scrolls past it: from its start while the strip enters
// the viewport to its end as it leaves.
const strip = document.querySelector('.about-strip');
if (strip && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const track = strip.querySelector('.about-strip-track');
	let ticking = false;
	const update = () => {
		ticking = false;
		const box = strip.getBoundingClientRect();
		const progress = Math.min(1, Math.max(0, (innerHeight - box.top) / (innerHeight + box.height)));
		const overflow = track.scrollWidth - strip.clientWidth;
		track.style.transform = `translateX(${-progress * overflow}px)`;
	};
	const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
	addEventListener('scroll', request, { passive: true });
	addEventListener('resize', request);
	update();
}
