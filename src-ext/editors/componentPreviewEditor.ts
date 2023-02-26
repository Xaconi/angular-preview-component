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
		console.log(context.extension.extensionPath);

        const provider = new ComponentPreviewEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ComponentPreviewEditorProvider.viewType, provider);
		return providerRegistration;
    }
    
    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		infoMessage('Custom Text Editor enabled');

		const angularBuildFolder: string = 'out';
		
		const fileNameComponent = document.fileName.split('\\').at(-1)!;
		const cssFileNameComponent = fileNameComponent.replace(".ts", ".css");
		const htmlFileNameComponent = fileNameComponent.replace(".ts", ".html");
		infoMessage('Copy files');
		fs.copyFileSync(document.fileName, `${this.context.extensionPath}\\src\\component\\${fileNameComponent}`);
		fs.copyFileSync(document.fileName.replace(".ts", ".css"), `${this.context.extensionPath}\\src\\component\\${cssFileNameComponent}`);
		fs.copyFileSync(document.fileName.replace(".ts", ".html"), `${this.context.extensionPath}\\src\\component\\${htmlFileNameComponent}`);
		
		const appModuleImport: string = `import { AppComponent } from './app.component';`;
		const appModuleComponentImport: string = `import { BotonIconComponent } from '../component/${fileNameComponent.replace('.ts', '')}';`;
		let appModuleText: string = fs.readFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		appModuleText = appModuleText.replace(appModuleImport, `${appModuleImport}\n${appModuleComponentImport}`)
		appModuleText = appModuleText.replace('[ AppComponent ]', '[ AppComponent, BotonIconComponent ]')
		fs.writeFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
		
		vscode.commands.executeCommand('angularpreview.initAngular').then(() => {
			webviewPanel.webview.options = {
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, angularBuildFolder))]
			};
			const documentName:string = document.uri.path.split("/").at(-1)!;
			webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);
			
			updateWebview();
		});

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
	}

    private _getHtmlForWebview(webview: vscode.Webview): string {
		const appDistPath = path.join(this.context.extensionPath, 'out');
		const appDistPathUri = vscode.Uri.file(appDistPath);
		const baseUri = webview.asWebviewUri(appDistPathUri);
		const indexPath = path.join(appDistPath, 'index.html');
		let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
	
		// update the base URI tag
		indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
	
		return indexHtml;
	}
}