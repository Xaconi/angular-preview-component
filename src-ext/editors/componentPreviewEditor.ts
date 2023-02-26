// Core
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Utils
import { getNonce, infoMessage, warningMessage } from '../utils';

export class ComponentPreviewEditorProvider implements vscode.CustomTextEditorProvider {

    // Data
    private static readonly viewType = 'angularpreview.componentPreview';

    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new ComponentPreviewEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ComponentPreviewEditorProvider.viewType, provider);
		return providerRegistration;
    }
    
    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		infoMessage('Custom Text Editor enabled');
		warningMessage('⚒️ TODO ⚒️ - Execute NPM start')

		const angularBuildFolder: string = 'out';

		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, angularBuildFolder))]
		};
		const documentName:string = document.uri.path.split("/").at(-1)!;
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
		// path to dist folder
		const appDistPath = path.join(this.context.extensionPath, 'out');
		const appDistPathUri = vscode.Uri.file(appDistPath);
	
		// path as uri
		const baseUri = webview.asWebviewUri(appDistPathUri);
	
		// get path to index.html file from dist folder
		const indexPath = path.join(appDistPath, 'index.html');
	
		// read index file from file system
		let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
	
		// update the base URI tag
		indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
	
		return indexHtml;
	}
}