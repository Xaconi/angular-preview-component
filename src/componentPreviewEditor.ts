import * as vscode from 'vscode';
import { getNonce } from './utils';

export class ComponentPreviewEditorProvider implements vscode.CustomTextEditorProvider {

    // Data
    private static readonly viewType = 'angularpreview.componentPreview';
	private static readonly message = 'HELLO WORLD';

    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new ComponentPreviewEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ComponentPreviewEditorProvider.viewType, provider);
		return providerRegistration;
    }
    
    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		updateWebview();
	}

    private _getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'editor.js'));

		const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Angular Preview Component</title>
			</head>
			<body>
				<p><strong>${ComponentPreviewEditorProvider.message}</strong></p>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>`;
	}
}