// Core
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Utils
import { infoMessage, successMessage } from '../utils/utils';

// Component
import Component from '../component/component';

export class ComponentPreviewEditorProvider implements vscode.CustomTextEditorProvider {

    // Data
    private static readonly viewType = 'angularpreview.componentPreview';
	private static readonly angularBuildFolder: string = 'out';
	private static buildTaskSuscription: vscode.EventEmitter<void>;
	private _componentTask?: Component;

	public webviewPanel: vscode.WebviewPanel;
	
    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    public register(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>): vscode.Disposable {
		const provider = new ComponentPreviewEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ComponentPreviewEditorProvider.viewType, provider);

		ComponentPreviewEditorProvider.buildTaskSuscription = buildTaskSuscription;

		return providerRegistration;
    }
    
    public async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken): Promise<void> {
		infoMessage('Custom Text Editor enabled');
		
		this.webviewPanel = webviewPanel;
		this._componentTask = new Component(this.context, ComponentPreviewEditorProvider.buildTaskSuscription);
		this._componentTask?.init(document);
		
		await vscode.commands.executeCommand('angularpreview.initAngular');
		ComponentPreviewEditorProvider.buildTaskSuscription.event(() => {
			this._createWebviewPanel(document);
			this._updateWebviewPanel(document);
			
			successMessage("BUILD TASK OK");
		});

		this._setWebviewListeners(document);
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

	private _createWebviewPanel(document: vscode.TextDocument): void {
		this.webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, ComponentPreviewEditorProvider.angularBuildFolder))]
		};
		const documentName:string = document.uri.path.split("/").at(-1)!;
		this.webviewPanel.webview.html = this._getHtmlForWebview(this.webviewPanel.webview);
	}

	private _updateWebviewPanel(document: vscode.TextDocument): void {
		this.webviewPanel.webview.postMessage({
			type: 'update',
			text: document.getText(),
		});
	}

	private _setWebviewListeners(document: vscode.TextDocument): void {
		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
			if (event.document.uri.toString() === document.uri.toString()) {
				this._updateWebviewPanel(event.document);
			}
		});

		this.webviewPanel.onDidDispose(() => changeDocumentSubscription.dispose());
	}
}