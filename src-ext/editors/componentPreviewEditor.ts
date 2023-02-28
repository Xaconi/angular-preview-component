// Core
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Utils
import { infoMessage, replaceLine, successMessage, warningMessage } from '../utils';
import { getClassName } from '../file';

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
		
		this._copyComponentFiles(document);
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
		const fileNameComponentPath = document.fileName.split('\\').at(-1)!;
		const fileNameComponent = fileNameComponentPath.replace('.ts', '');

		let appModuleText: string = fs.readFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		let componentText: string = fs.readFileSync(`${document.fileName}`).toString();

		// @TODO - Dynamic component class name
		const className = getClassName(componentText);
		const appModuleComponentImport: string = `import { ${className} } from '../component/${fileNameComponent.replace('.ts', '')}';`;
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.importHook, `/* @APComponentImport */ ${appModuleComponentImport}`)
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.declarationHook, `/* @APComponentDeclaration */ ${className}`)
		fs.writeFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}

	private _resetAppModuleFile(document: vscode.TextDocument): void {
		let appModuleText: string = fs.readFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.importHook, `/* @APComponentImport */`)
		appModuleText = replaceLine(appModuleText, ComponentPreviewEditorProvider.declarationHook, `/* @APComponentDeclaration */`)
		fs.writeFileSync(`${this.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}

	private _copyComponentFiles(document: vscode.TextDocument): void {
		const fileNameComponent = document.fileName.split('\\').at(-1)!;
		const cssFileNameComponent = fileNameComponent.replace(".ts", ".css");
		const htmlFileNameComponent = fileNameComponent.replace(".ts", ".html");
		const scssFileNameComponent = fileNameComponent.replace(".ts", ".scss");

		const tsFileNameComponentPath = document.fileName;
		const cssFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".css");
		const htmlFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".html");
		const scssFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".scss");

		infoMessage('Copy files');
		if(fs.existsSync(tsFileNameComponentPath)) fs.copyFileSync(tsFileNameComponentPath, `${this.context.extensionPath}\\src\\component\\${fileNameComponent}`);
		if(fs.existsSync(cssFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".css"), `${this.context.extensionPath}\\src\\component\\${cssFileNameComponent}`);
		if(fs.existsSync(htmlFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".html"), `${this.context.extensionPath}\\src\\component\\${htmlFileNameComponent}`);
		if(fs.existsSync(scssFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".scss"), `${this.context.extensionPath}\\src\\component\\${scssFileNameComponent}`);
	}
}