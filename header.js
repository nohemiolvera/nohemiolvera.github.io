// Condense the sticky header once the page scrolls past the top.
const header = document.querySelector('.site-header');
if (header) {
	const update = () => header.classList.toggle('is-condensed', scrollY > 40);
	addEventListener('scroll', update, { passive: true });
	update();
}

// Four roughen filters with different noise seeds. The logo steps through them so its edges wobble like a
// hand-drawn, stop-motion loop.
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position: absolute" aria-hidden="true">${[1, 2, 3, 4].map((seed) => `
	<filter id="boil-${seed}" x="-5%" y="-5%" width="110%" height="110%">
		<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" seed="${seed}"/>
		<feDisplacementMap in="SourceGraphic" scale="1.9" xChannelSelector="R" yChannelSelector="G"/>
	</filter>`).join('')}
	<filter id="ink" color-interpolation-filters="sRGB">
		<feFlood style="flood-color: var(--ink-strong)"/>
		<feComposite in2="SourceAlpha" operator="in"/>
	</filter></svg>`);
// "ink" above repaints a graphic in the text color, for logos on the dark theme.
