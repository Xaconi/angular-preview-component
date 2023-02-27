// Core
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Utils
import { getNonce, infoMessage, replaceLine, successMessage, warningMessage } from '../utils';

export class ComponentPreviewEditorProvider implements vscode.CustomTextEditorProvider {

    // Data
    private static readonly viewType = 'angularpreview.componentPreview';
	private static readonly importHook = '@APComponentImport';
	private static readonly declarationHook = '@APComponentDeclaration';
	private static buildTaskSuscription: vscode.EventEmitter<void>;

    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    public static register(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>): vscode.Disposable {
		ComponentPreviewEditorProvider.buildTaskSuscription = buildTaskSuscription;
        const provider = new ComponentPreviewEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ComponentPreviewEditorProvider.viewType, provider);
		return providerRegistration;
    }
    
    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		infoMessage('Custom Text Editor enabled');

		const angularBuildFolder: string = 'out';
		
		// @TODO - Create copy component files function
		const fileNameComponent = document.fileName.split('\\').at(-1)!;
		const cssFileNameComponent = fileNameComponent.replace(".ts", ".css");
		const htmlFileNameComponent = fileNameComponent.replace(".ts", ".html");
		infoMessage('Copy files');
		fs.copyFileSync(document.fileName, `${this.context.extensionPath}\\src\\component\\${fileNameComponent}`);
		fs.copyFileSync(document.fileName.replace(".ts", ".css"), `${this.context.extensionPath}\\src\\component\\${cssFileNameComponent}`);
		fs.copyFileSync(document.fileName.replace(".ts", ".html"), `${this.context.extensionPath}\\src\\component\\${htmlFileNameComponent}`);
		
		this._updateAppModuleFile(document);
		
		await vscode.commands.executeCommand('angularpreview.initAngular');

		ComponentPreviewEditorProvider.buildTaskSuscription.event(() => {
			this._resetAppModuleFile(document);
			webviewPanel.webview.options = {
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, angularBuildFolder))]
			};
			const documentName:string = document.uri.path.split("/").at(-1)!;
			webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);
			
			updateWebview();
			
			successMessage("BUILD TASK OK");
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
		indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
	
		return indexHtml;
	}

	private _updateAppModuleFile(document: vscode.TextDocument): void {
		const fileNameComponent = document.fileName.split('\\').at(-1)!.replace('.ts', '');

		let appModuleText: string = fs.readFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`).toString();

		// @TODO - Dynamic component class name
		const appModuleComponentImport: string = `import { BotonIconComponent } from '../component/${fileNameComponent.replace('.ts', '')}';`;
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.importHook, `/* @APComponentImport */ ${appModuleComponentImport}`)
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.declarationHook, `/* @APComponentDeclaration */ BotonIconComponent`)
		fs.writeFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}

	private _resetAppModuleFile(document: vscode.TextDocument): void {
		const fileNameComponent = document.fileName.split('\\').at(-1)?.replace('.ts', '');

		let appModuleText: string = fs.readFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.importHook, `/* @APComponentImport */`)
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.declarationHook, `/* @APComponentDeclaration */`)
		fs.writeFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}
}