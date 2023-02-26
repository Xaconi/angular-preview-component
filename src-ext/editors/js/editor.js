// @ts-check

(function () {
	// @ts-ignore
	const vscode = acquireVsCodeApi();

	function updateContent(/** @type {string} */ text) {
		let json;
		try {
			if (!text) {
				text = '{}';
			}
			json = JSON.parse(text);
		} catch {
			return;
		}
	}

	window.addEventListener('message', event => {
		const message = event.data;
		switch (message.type) {
			case 'update':
				const text = message.text;
				updateContent(text);
				vscode.setState({ text });
				return;
		}
	});

	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());