// Live ASCII art, with the motion of the self-serve tool's ASCII texture: the art keeps its exact shape,
// a slow diagonal wave passes over it, and every character flickers to a neighboring weight now and then.
// The dots around it twinkle. All on whole numbers of cycles per loop, so it repeats seamlessly.
// Markup: <pre data-ascii-live>…art…</pre>
(function () {
	var pres = [].slice.call(document.querySelectorAll('pre[data-ascii-live]'));
	if (!pres.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	var RAMP = ' .:-=+*#%@'; // light to heavy
	var LOOP = 12; // seconds
	var FPS = 12;

	function hash(a, b) {
		var h = Math.imul(a, 374761393) ^ Math.imul(b, 668265263);
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
	}

	pres.forEach(function (pre) {
		var rows = pre.textContent.split('\n');
		var cells = rows.map(function (line) {
			return Array.from(line).map(function (ch) { return RAMP.indexOf(ch); });
		});
		var visible = false, last = 0, start = performance.now();

		function render(time) {
			var a = (2 * Math.PI * time) / LOOP, progress = time / LOOP;
			pre.textContent = cells.map(function (line, row) {
				return line.map(function (level, col) {
					if (level < 0) return rows[row][col]; // anything not on the ramp stays as it is
					if (level === 0) return ' ';
					var cell = row * 997 + col;
					// Each character's run of random rolls, changing a whole number of times per loop.
					var changes = Math.max(1, Math.round(LOOP * 0.5 * (0.5 + hash(cell, 1))));
					var step = Math.floor(progress * changes + hash(cell, 2) * changes) % changes;
					var roll = hash(cell, step + 3);
					if (level <= 2) {
						// The dots twinkle: now and then a dot turns to a colon or drops out for a beat.
						return roll < 0.12 ? ' ' : roll > 0.85 ? (level === 1 ? ':' : '.') : RAMP[level];
					}
					// The art: a soft wave lifts and lowers the weight as it passes, plus the odd flicker.
					var wave = Math.sin((col * 0.55 + row) / 5 - 3 * a);
					var shift = Math.round(wave * 1.2) + (roll < 0.15 ? -1 : roll > 0.85 ? 1 : 0);
					return RAMP[Math.max(3, Math.min(RAMP.length - 1, level + shift))];
				}).join('');
			}).join('\n');
		}

		function tick(now) {
			if (!visible) return;
			if (now - last >= 1000 / FPS) {
				last = now;
				render(((now - start) / 1000) % LOOP);
			}
			requestAnimationFrame(tick);
		}

		new IntersectionObserver(function (entries) {
			var was = visible;
			visible = entries[0].isIntersecting;
			if (visible && !was) requestAnimationFrame(tick);
		}).observe(pre);
	});
})();
