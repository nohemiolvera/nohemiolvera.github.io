// Work rows: each strip drifts to the left on its own and loops forever. The previews are
// moved with transforms, which stay smooth on phones, and the loop has no copies: a preview that leaves on the
// left is moved to the end of the line. Drag or swipe a strip to move it, with a little momentum when you let
// go; hovering pauses it. Vertical swipes still scroll the page. A strip only moves while it's on screen.
// Reduced motion stops the drift; dragging still works.
const SPEED = Number(document.body.dataset.rowSpeed) || 22; // px per second; a page can set its own with data-row-speed
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.work-row-track').forEach((track, index) => {
	const tiles = [...track.children];
	if (tiles.length < 2) return;
	track.classList.add('is-belt');
	const speed = SPEED * (1 + (index % 3) * 0.12); // rows at slightly different speeds, so they don't move in lockstep

	// Layout, measured with the previews in their resting places.
	let base = [], widths = [], loop = 0, edge = 0;
	const measure = () => {
		tiles.forEach((tile) => { tile.style.transform = ''; });
		const first = tiles[0].offsetLeft;
		base = tiles.map((tile) => tile.offsetLeft - first);
		widths = tiles.map((tile) => tile.offsetWidth);
		const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
		loop = base[base.length - 1] + widths[widths.length - 1] + gap;
		edge = first; // the page margin to the left of the first preview
		place();
	};

	// x is how far the strip has travelled. Each preview sits at its resting place minus x, wrapped around the
	// loop so it reappears at the end once it's fully past the left edge of the window.
	let x = 0;
	const place = () => {
		if (!loop) return;
		tiles.forEach((tile, i) => {
			const w = widths[i] + edge;
			const p = ((base[i] - x + w) % loop + loop) % loop - w;
			tile.style.transform = `translate3d(${p - base[i]}px, 0, 0)`;
		});
	};

	let visible = false, hovered = false, down = false, moved = false, frame = 0, last = 0;
	let startX = 0, startY = 0, startPos = 0, velocity = 0, lastMoveX = 0, lastMoveAt = 0, resumeAt = 0;

	track.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		down = true; moved = false; velocity = 0;
		startX = lastMoveX = e.clientX; startY = e.clientY; startPos = x; lastMoveAt = performance.now();
	});
	track.addEventListener('pointermove', (e) => {
		if (!down) return;
		const dx = e.clientX - startX;
		if (!moved) {
			// A mostly vertical swipe is a page scroll: let it go.
			if (Math.abs(e.clientY - startY) > Math.abs(dx) && e.pointerType !== 'mouse') { down = false; return; }
			if (Math.abs(dx) < 5) return;
			moved = true;
			track.classList.add('is-dragging');
			try { track.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
		}
		const now = performance.now();
		velocity = (lastMoveX - e.clientX) / Math.max(1, now - lastMoveAt) * 1000; // px per second
		lastMoveX = e.clientX; lastMoveAt = now;
		x = startPos - dx;
		place();
	});
	const release = () => {
		if (!down) return;
		down = false;
		track.classList.remove('is-dragging');
		resumeAt = performance.now() + 900; // glide, then drift again
		if (!frame && visible) frame = requestAnimationFrame(tick);
	};
	track.addEventListener('pointerup', release);
	track.addEventListener('pointercancel', release);
	track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
	track.addEventListener('dragstart', (e) => e.preventDefault());
	track.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
	track.addEventListener('pointerleave', () => { hovered = false; });
	track.addEventListener('keydown', (e) => {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		velocity = e.key === 'ArrowRight' ? 1400 : -1400;
		resumeAt = performance.now() + 900;
		if (!frame && visible) frame = requestAnimationFrame(tick);
	});

	const tick = (now) => {
		frame = 0;
		if (!visible) return;
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
		last = now;
		if (!down) {
			if (Math.abs(velocity) > 5) {
				x += velocity * dt; // momentum after a drag or a key press, easing out
				velocity *= Math.pow(0.004, dt);
			} else if (!hovered && !still && now >= resumeAt) {
				x += speed * dt;
			}
			place();
		}
		frame = requestAnimationFrame(tick);
	};

	new ResizeObserver(measure).observe(track);
	new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible && !frame) { last = 0; frame = requestAnimationFrame(tick); }
	}, { rootMargin: '100px 0px' }).observe(track);
});
