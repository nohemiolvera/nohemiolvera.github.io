// Show the current time in the footer clock's time zone, updated every 30 seconds.
document.querySelectorAll('.clock').forEach((el) => {
	const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: el.dataset.tz });
	const tick = () => { el.textContent = `${fmt.format(new Date())} CT`; };
	tick();
	setInterval(tick, 30000);
});
