// Cycle the intro role word through the list in data-roles.
const role = document.querySelector('.role');
const article = document.querySelector('.role-article');
if (role && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const roles = role.dataset.roles.split(',').map((r) => r.trim());
	let i = 0;
	setInterval(() => {
		role.classList.add('is-out');
		setTimeout(() => {
			i = (i + 1) % roles.length;
			role.textContent = roles[i];
			if (article) article.textContent = /^[aeiou]/i.test(roles[i]) ? 'an' : 'a';
			role.classList.replace('is-out', 'is-in');
			role.offsetWidth; // flush so the next class change animates
			role.classList.remove('is-in');
		}, 250);
	}, 2800);
}
