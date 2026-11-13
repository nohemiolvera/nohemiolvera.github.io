/*
 * System diagram — Laravel brand system case study
 * One data model, two layouts: wide, and on phones the first two layers stacked above the last two side by side.
 * Markup: <figure class="sys" data-sys> ... <div class="sys-canvas"></div> ... </figure>
 */
(function () {
	'use strict';

	var SVGNS = 'http://www.w3.org/2000/svg';

	// ---- Data model -------------------------------------------------------
	var COLUMNS = ['Source of truth', 'The brand, written down', 'What people use', 'What comes out'];

	var NODES = [
		{ id: 'figma', col: 0, title: 'Figma', sub: 'Color, type, spacing, logos' },
		{ id: 'brand', col: 1, group: true, title: 'Brand repo', rows: [
			{ title: 'Rules', sub: 'Plain words for people and Claude' },
			{ title: 'Checks', sub: 'Catch anything drifting from Figma' },
			{ title: 'Decision log', sub: 'Every call, with its reason' }
		] },
		{ id: 'site', col: 2, title: 'Guidelines site', sub: 'The hub, for people' },
		{ id: 'tools', col: 2, title: 'Self-serve tools', sub: 'Blog and social images' },
		{ id: 'illo', col: 2, title: 'Illustration library', sub: 'In progress', pending: true },
		{ id: 'claude', col: 2, title: 'Claude brand system', sub: 'The same rules, for agents' },
		{ id: 'o-downloads', col: 3, title: 'Brand downloads' },
		{ id: 'o-social', col: 3, title: 'Social and OG images' },
		{ id: 'o-blog', col: 3, title: 'Blog images' },
		{ id: 'o-diagrams', col: 3, title: 'Diagrams for posts' },
		{ id: 'o-decks', col: 3, title: 'Slides and PDFs' },
		{ id: 'o-ui', col: 3, title: 'Interfaces' }
	];

	var EDGES = [
		['figma', 'brand'],
		['brand', 'site'], ['brand', 'tools'], ['brand', 'illo'], ['brand', 'claude'],
		['site', 'o-downloads'],
		['tools', 'o-social'], ['tools', 'o-blog'],
		['illo', 'o-blog', 'pending'], ['illo', 'o-diagrams', 'pending'],
		['claude', 'o-diagrams'], ['claude', 'o-decks'], ['claude', 'o-ui']
	];

	// Example outputs, each traced from Figma to what comes out. The caption's
	// <button data-sys-example="…"> links light these paths.
	var EXAMPLES = {
		blog: ['figma', 'brand', 'tools', 'o-blog'],
		deck: ['figma', 'brand', 'claude', 'o-decks'],
		diagram: ['figma', 'brand', 'claude', 'o-diagrams']
	};

	// ---- Layouts ----------------------------------------------------------
	var H_TITLED = 58, H_PLAIN = 42, ROW_H = 52, GROUP_HEAD = 38;

	function nodeHeight(n) {
		if (n.group) return GROUP_HEAD + n.rows.length * ROW_H + 6;
		return n.sub ? H_TITLED : H_PLAIN;
	}

	function byCol(c) { return NODES.filter(function (n) { return n.col === c; }); }

	function layoutWide() {
		var W = 1200, top = 52, gap = [0, 0, 18, 12];
		var xs = [0, 278, 594, 916], ws = [196, 246, 252, 284];
		var heights = [0, 1, 2, 3].map(function (c) {
			var list = byCol(c);
			return list.reduce(function (s, n) { return s + nodeHeight(n); }, 0) + gap[c] * (list.length - 1);
		});
		var area = Math.max.apply(null, heights);
		var pos = {};
		[0, 1, 2, 3].forEach(function (c) {
			var y = top + (area - heights[c]) / 2;
			byCol(c).forEach(function (n) {
				var h = nodeHeight(n);
				pos[n.id] = { x: xs[c], y: y, w: ws[c], h: h };
				y += h + gap[c];
			});
		});
		return {
			width: W, height: top + area + 8, pos: pos,
			headers: xs.map(function (x, i) { return { x: x, y: 20, text: COLUMNS[i] }; })
		};
	}

	// Phones: Figma, then the brand repo, full width; below them what people use and what comes out side by side.
	// Drawn 460 wide so it renders smaller than the screen-filling boxes would.
	function layoutStacked() {
		var W = 460, RAIL = 20, pos = {}, headers = [], y;
		headers.push({ x: 0, y: 14, text: COLUMNS[0] });
		pos.figma = { x: 0, y: 28, w: W, h: nodeHeight(byCol(0)[0]) };
		y = pos.figma.y + pos.figma.h + 44;
		headers.push({ x: 0, y: y - 14, text: COLUMNS[1] });
		pos.brand = { x: 0, y: y, w: W, h: nodeHeight(byCol(1)[0]) };
		y += pos.brand.h + 48;
		var xs = { 2: RAIL, 3: 256 }, ws = { 2: 205, 3: 204 }, gap = { 2: 14, 3: 10 }, heights = {};
		headers.push({ x: xs[2], y: y - 14, text: COLUMNS[2] });
		headers.push({ x: xs[3], y: y - 14, text: COLUMNS[3] });
		[2, 3].forEach(function (c) {
			var list = byCol(c);
			heights[c] = list.reduce(function (s, n) { return s + nodeHeight(n); }, 0) + gap[c] * (list.length - 1);
		});
		var area = Math.max(heights[2], heights[3]);
		[2, 3].forEach(function (c) {
			var yy = y + (area - heights[c]) / 2;
			byCol(c).forEach(function (n) {
				var h = nodeHeight(n);
				pos[n.id] = { x: xs[c], y: yy, w: ws[c], h: h };
				yy += h + gap[c];
			});
		});
		return { width: W, height: y + area + 4, pos: pos, headers: headers, rail: 7 };
	}

	// ---- Helpers ----------------------------------------------------------
	function el(name, attrs, parent) {
		var e = document.createElementNS(SVGNS, name);
		for (var k in attrs) e.setAttribute(k, attrs[k]);
		if (parent) parent.appendChild(e);
		return e;
	}

	// Right-angle connectors with small rounded corners. lane shifts the vertical run
	// so sources sharing a gap each get their own track instead of piling onto one line.
	var CORNER = 6;

	function elbow(x1, y1, xm, y2, x2) {
		if (Math.abs(y2 - y1) < 1) return 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2;
		var dir = y2 > y1 ? 1 : -1;
		var r = Math.min(CORNER, Math.abs(y2 - y1) / 2, Math.abs(xm - x1), Math.abs(x2 - xm));
		return 'M' + x1 + ' ' + y1 + ' L' + (xm - r) + ' ' + y1 + ' Q' + xm + ' ' + y1 + ' ' + xm + ' ' + (y1 + dir * r) +
			' L' + xm + ' ' + (y2 - dir * r) + ' Q' + xm + ' ' + y2 + ' ' + (xm + r) + ' ' + y2 + ' L' + x2 + ' ' + y2;
	}

	function edgePath(a, b, lane, rail) {
		if (a.x + a.w <= b.x) {
			var x1 = a.x + a.w, x2 = b.x;
			return elbow(x1, a.y + a.h / 2, (x1 + x2) / 2 + lane, b.y + b.h / 2, x2);
		}
		if (b.w >= a.w) {
			// Phones: straight down between the two full-width layers.
			var cx = a.x + a.w / 2;
			return 'M' + cx + ' ' + (a.y + a.h) + ' L' + cx + ' ' + b.y;
		}
		// Phones: down a rail on the left, then a right angle into the box.
		var sy = a.y + a.h, ty = b.y + b.h / 2;
		return 'M' + rail + ' ' + sy + ' L' + rail + ' ' + (ty - CORNER) +
			' Q' + rail + ' ' + ty + ' ' + (rail + CORNER) + ' ' + ty + ' L' + b.x + ' ' + ty;
	}

	// Each source's lane: sources in the same column spread evenly around the gap's middle.
	function lanes(L) {
		var out = {};
		[0, 1, 2].forEach(function (c) {
			var sources = NODES.filter(function (n) {
				return n.col === c && EDGES.some(function (e) { return e[0] === n.id; });
			});
			var next = NODES.filter(function (n) { return n.col === c + 1; })[0];
			var gap = next ? L.pos[next.id].x - (L.pos[sources[0].id].x + L.pos[sources[0].id].w) : 0;
			var step = Math.min(8, gap / (sources.length + 3));
			sources.forEach(function (n, i) { out[n.id] = (i - (sources.length - 1) / 2) * step; });
		});
		return out;
	}

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var stacked = window.matchMedia('(max-width: 720px)'); // the site's phone breakpoint

	// ---- Graph helpers ----------------------------------------------------
	function related(id) {
		var up = {}, down = {};
		(function walkUp(x) { EDGES.forEach(function (e) { if (e[1] === x && !up[e[0]]) { up[e[0]] = 1; walkUp(e[0]); } }); })(id);
		(function walkDown(x) { EDGES.forEach(function (e) { if (e[0] === x && !down[e[1]]) { down[e[1]] = 1; walkDown(e[1]); } }); })(id);
		var nodes = Object.assign({}, up, down); nodes[id] = 1;
		return nodes;
	}

	// ---- Render -----------------------------------------------------------
	function Diagram(root) {
		this.root = root;
		this.canvas = root.querySelector('.sys-canvas');
		this.timers = [];
		this.pinned = 'blog'; // the example shown; a click or tap on a pill changes it
		this.shown = null;
		var self = this;

		this.render();
		stacked.addEventListener('change', function () { self.render(); self.showExample(self.shown); });

		// Exploring the diagram by hover sets the example's red aside.
		this.canvas.addEventListener('mouseenter', function () { root.classList.add('is-exploring'); });
		this.canvas.addEventListener('mouseleave', function () { root.classList.remove('is-exploring'); });

		// Example pills: a click or tap switches the path shown.
		this.links = Array.prototype.slice.call(root.querySelectorAll('[data-sys-example]'));
		this.links.forEach(function (link) {
			var key = link.getAttribute('data-sys-example');
			link.addEventListener('click', function () { self.pinned = key; self.showExample(key); });
		});
		this.showExample(this.pinned);
	}

	Diagram.prototype.render = function () {
		var L = stacked.matches ? layoutStacked() : layoutWide();
		this.canvas.innerHTML = '';

		var svg = el('svg', {
			viewBox: '-2 -2 ' + (L.width + 4) + ' ' + (L.height + 4),
			class: 'sys-svg',
			role: 'img',
			'aria-labelledby': 'sys-title sys-desc'
		});
		el('title', { id: 'sys-title' }, svg).textContent = 'How the Laravel brand system connects';
		el('desc', { id: 'sys-desc' }, svg).textContent =
			'Figma is the source of truth. It feeds a brand repo of rules, checks and a decision log. ' +
			'The repo feeds four things people use: the guidelines site, self-serve tools, an illustration library in progress, ' +
			'and the Claude brand system. Those produce downloads, social and OG images, blog images, diagrams for posts, slides and PDFs, and interfaces.';

		var headers = el('g', { class: 'sys-headers', 'aria-hidden': 'true' }, svg);
		L.headers.forEach(function (h) { el('text', { x: h.x, y: h.y, class: 'sys-colhead' }, headers).textContent = h.text.toUpperCase(); });

		var edgeLayer = el('g', { class: 'sys-edges', 'aria-hidden': 'true' }, svg);
		var pulseLayer = el('g', { class: 'sys-pulses', 'aria-hidden': 'true' }, svg);
		var nodeLayer = el('g', { class: 'sys-nodes' }, svg);

		var lane = lanes(L);
		this.edges = EDGES.map(function (e) {
			var d = edgePath(L.pos[e[0]], L.pos[e[1]], lane[e[0]], L.rail);
			var path = el('path', { d: d, class: 'sys-edge' + (e[2] ? ' is-pending' : '') }, edgeLayer);
			var pulse = el('path', { d: d, class: 'sys-pulse' }, pulseLayer);
			return { from: e[0], to: e[1], path: path, pulse: pulse, len: 0 };
		});

		var self = this;
		this.nodeEls = {};
		NODES.forEach(function (n) {
			var p = L.pos[n.id];
			var g = el('g', {
				class: 'sys-node' + (n.group ? ' sys-node--group' : '') + (n.pending ? ' is-pending' : '') + (n.col === 3 ? ' sys-node--out' : ''),
				transform: 'translate(' + p.x + ' ' + p.y + ')',
				tabindex: '0',
				'aria-label': n.title + (n.sub ? ', ' + n.sub : '') + (n.rows ? ': ' + n.rows.map(function (r) { return r.title; }).join(', ') : '')
			}, nodeLayer);
			el('rect', { width: p.w, height: p.h, rx: 2, class: 'sys-box' }, g);

			if (n.group) {
				el('text', { x: 16, y: 24, class: 'sys-title' }, g).textContent = n.title;
				n.rows.forEach(function (r, i) {
					var ry = GROUP_HEAD + i * ROW_H;
					el('rect', { x: 8, y: ry, width: p.w - 16, height: ROW_H - 6, rx: 2, class: 'sys-row' }, g);
					el('text', { x: 22, y: ry + 19, class: 'sys-rowtitle' }, g).textContent = r.title;
					el('text', { x: 22, y: ry + 35, class: 'sys-sub' }, g).textContent = r.sub;
				});
			} else if (n.sub) {
				el('text', { x: 16, y: 25, class: 'sys-title' }, g).textContent = n.title;
				el('text', { x: 16, y: 42, class: 'sys-sub' }, g).textContent = n.sub;
			} else {
				el('text', { x: 18, y: 25.5, class: 'sys-title sys-title--out' }, g).textContent = n.title;
			}

			g.addEventListener('mouseenter', function () { self.focus(n.id); });
			g.addEventListener('mouseleave', function () { self.focus(null); });
			g.addEventListener('focus', function () { self.focus(n.id); });
			g.addEventListener('blur', function () { self.focus(null); });
			self.nodeEls[n.id] = g;
		});

		this.canvas.appendChild(svg);

	};

	// Keep only these nodes, and the edges between them, at full strength.
	Diagram.prototype.highlight = function (keep, onEdge) {
		this.root.classList.toggle('is-focusing', !!keep);
		for (var k in this.nodeEls) this.nodeEls[k].classList.toggle('is-on', !!keep && !!keep[k]);
		this.edges.forEach(function (e) { e.path.classList.toggle('is-on', !!keep && onEdge(e)); });
	};

	// Hover / focus: show everything this node depends on and everything it feeds.
	// Letting go returns to the example being shown.
	Diagram.prototype.focus = function (id) {
		if (!id) { this.showExample(this.shown); return; }
		var keep = related(id);
		this.highlight(keep, function (e) { return keep[e.from] && keep[e.to]; });
	};

	function pathEdges(edges, path) {
		return edges.filter(function (e) {
			var i = path.indexOf(e.from);
			return i > -1 && path[i + 1] === e.to;
		});
	}

	// A few dots on each line of the path, DOT_GAP apart, drifting from Figma toward the output at
	// DOT_SPEED a second (both in diagram units). Each line starts at its own point so they don't march in step.
	var DOT_GAP = 30;
	var DOT_SPEED = 15;

	// An example's path, lit, with a steady stream of dots flowing along it from Figma to the output.
	Diagram.prototype.showExample = function (key) {
		var self = this;
		this.shown = key;
		this.timers.forEach(clearTimeout);
		this.timers = [];
		for (var k in this.nodeEls) this.nodeEls[k].classList.remove('is-lit', 'is-done');
		this.edges.forEach(function (e) {
			e.pulse.getAnimations().forEach(function (a) { a.cancel(); });
			e.pulse.classList.remove('is-flowing');
		});
		this.links.forEach(function (l) {
			var id = l.getAttribute('data-sys-example');
			l.classList.toggle('is-active', id === key);
			l.setAttribute('aria-pressed', id === self.pinned ? 'true' : 'false');
		});

		var path = EXAMPLES[key];
		var keep = {};
		path.forEach(function (id) { keep[id] = 1; self.light(id); });
		var hops = pathEdges(this.edges, path);
		this.highlight(keep, function (e) { return hops.indexOf(e) > -1; });
		hops.forEach(function (e) { e.pulse.classList.add('is-flowing'); });
		if (reduceMotion.matches) return;

		hops.forEach(function (e, i) {
			var start = (i * 0.37 % 1) * DOT_GAP;
			e.pulse.animate(
				[{ strokeDashoffset: -start }, { strokeDashoffset: -start - DOT_GAP }],
				{ duration: DOT_GAP / DOT_SPEED * 1000, iterations: Infinity }
			);
		});
	};

	Diagram.prototype.light = function (id) {
		this.nodeEls[id].classList.add('is-lit');
		if (this.nodeEls[id].classList.contains('sys-node--out')) this.nodeEls[id].classList.add('is-done');
	};

	function init() {
		document.querySelectorAll('[data-sys]').forEach(function (root) { new Diagram(root); });
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
