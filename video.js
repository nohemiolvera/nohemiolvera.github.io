// Videos load only when near the viewport, then play silently while visible and pause off-screen.
// Without JS, or with reduced motion, they keep their controls and play only on request.
const videos = document.querySelectorAll('video[preload="none"]');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const io = new IntersectionObserver((entries) => {
		entries.forEach((e) => {
			if (e.isIntersecting) e.target.play().catch(() => {});
			else e.target.pause();
		});
	}, { rootMargin: '200px 0px' });
	videos.forEach((video) => {
		video.removeAttribute('controls');
		io.observe(video);
	});
}
