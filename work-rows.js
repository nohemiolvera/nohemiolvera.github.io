// Work rows: each strip drifts slowly to the left on its own and loops. The previews are repeated
// once so the loop has no seam. Hovering, dragging, touching, or scrolling a strip pauses it, and
// it picks up again from wherever it was left. Reduced motion keeps the strips still.
// With a mouse, a strip can be dragged sideways; a drag doesn't count as a click on a preview.
// Runs before video.js, so the repeated videos play like the others.
const SPEED = Number(document.body.dataset.rowSpeed) || 22; // px per second; a page can set its own with data-row-speed
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.work-row-track').forEach((track, index) => {
	const tiles = [...track.children];
	for (const tile of tiles) {
		const copy = tile.cloneNode(true);
		copy.setAttribute('aria-hidden', 'true');
		track.append(copy);
	}
	const loopWidth = () => track.children[tiles.length].offsetLeft - tiles[0].offsetLeft;

	let pos = 0, hovered = false, held = false, resumeAt = 0, visible = false;
	const pauseFor = (ms) => { resumeAt = performance.now() + ms; };

	// Mouse drag
	let startX = 0, startScroll = 0, moved = false, down = false;
	track.addEventListener('pointerdown', (e) => {
		if (e.pointerType !== 'mouse') { held = true; return; }
		if (e.button !== 0) return;
		down = true; moved = false;
		startX = e.clientX; startScroll = track.scrollLeft;
	});
	addEventListener('pointermove', (e) => {
		if (!down) return;
		const dx = e.clientX - startX;
		if (!moved && Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
		if (moved) track.scrollLeft = startScroll - dx;
	});
	addEventListener('pointerup', () => {
		held = false;
		if (!down) return;
		down = false;
		track.classList.remove('is-dragging');
		pauseFor(1500);
	});
	addEventListener('pointercancel', () => { held = false; down = false; track.classList.remove('is-dragging'); });
	track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
	track.addEventListener('dragstart', (e) => e.preventDefault());
	track.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
	track.addEventListener('pointerleave', () => { hovered = false; });
	track.addEventListener('wheel', () => pauseFor(1500), { passive: true });
	track.addEventListener('touchend', () => pauseFor(2500), { passive: true });

	if (still) return;
	new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(track);

	let last = 0;
	const tick = (now) => {
		const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
		last = now;
		const width = loopWidth();
		if (hovered || held || down || now < resumeAt || !visible) {
			pos = track.scrollLeft; // pick up from wherever it was left
		} else {
			// Rows run at slightly different speeds, so they don't move in lockstep.
			pos += dt * SPEED * (1 + (index % 3) * 0.12);
		}
		if (width > 0) {
			if (pos >= width) pos -= width;
			if (pos < 0) pos += width;
		}
		if (Math.abs(track.scrollLeft - pos) >= 0.5) track.scrollLeft = pos;
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
});
