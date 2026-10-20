// Wrap each ASCII-art character in a span with one of 20 random entrance keyframes, so the art builds up
// one character at a time while every character still shares the slide's loop.
document.querySelectorAll('.hf-ascii').forEach((pre) => {
	pre.innerHTML = pre.textContent.replace(/\S/g, (c) => `<span style="animation-name: hf-c${Math.floor(Math.random() * 20)}">${c}</span>`);
});
