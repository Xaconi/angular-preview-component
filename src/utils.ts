export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function infoMessage(text: string): void {
	console.log(`🔵 AP - ${text}`);
}

export function warningMessage(text: string): void {
	console.log(`🟡 AP - ${text}`);
}

export function errorMessage(text: string): void {
	console.log(`🔴 AP - ${text}`);
}

export function successMessage(text: string): void {
	console.log(`🟢 AP - ${text}`);
}