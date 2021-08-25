export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = src;
		image.hidden = true;

		image.addEventListener('load', () => {
			resolve(image);
		});

		image.addEventListener('error', () => {
			reject(null);
		});

		document.body.appendChild(image);
		document.body.removeChild(image);
	});
}