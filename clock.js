// Show the current time, with seconds, in the footer clock's time zone, updated every second.
document.querySelectorAll('.clock').forEach((el) => {
	const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: el.dataset.tz });
	const tick = () => { el.textContent = `${fmt.format(new Date())} CT`; };
	tick();
	setInterval(tick, 1000);
});
