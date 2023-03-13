// Core
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Utils
import { infoMessage, successMessage } from '../utils/utils';

// Component
import Component from '../component/component';

export class WebviewPanel implements vscode.WebviewPanelSerializer {

    // Data
    private static readonly viewType = 'angularpreview.componentPreview';
	private static readonly angularBuildFolder: string = 'out';
	private _componentTask?: Component;
	
	private _webviewPanel: vscode.WebviewPanel;
	private _context: vscode.ExtensionContext
	private _buildTaskSuscription: vscode.EventEmitter<void>;
	private _document: vscode.TextDocument;

	deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown): Thenable<void> {
		throw new Error('Method not implemented.');
	}
    
    public async init(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>): Promise<void> {
		infoMessage('Webview Panel Init');
		
		this._context = context;
		this._buildTaskSuscription = buildTaskSuscription;

		this._componentTask = new Component(this._context, this._buildTaskSuscription);
		const activeEditor: vscode.TextEditor = vscode.window.activeTextEditor!;
    	this._document = activeEditor.document;
		this._componentTask?.init(this._document);
		
		this._buildTaskSuscription.event(() => {
			this._createWebviewPanel(this._document);
			this._updateWebviewPanel(this._document);
			
			successMessage("BUILD TASK OK");
		});
	}

    private _getHtmlForWebview(webview: vscode.Webview): string {
		const appDistPath = path.join(this._context.extensionPath, 'out');
		const appDistPathUri = vscode.Uri.file(appDistPath);
		const baseUri = webview.asWebviewUri(appDistPathUri);
		const indexPath = path.join(appDistPath, 'index.html');

		let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
		indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
	
		return indexHtml;
	}

	private _createWebviewPanel(document: vscode.TextDocument): void {
		this._webviewPanel = vscode.window.createWebviewPanel(
			WebviewPanel.viewType,
			'Angular Preview Component',
			vscode.ViewColumn.Beside,
			{
			  enableScripts: true,
			  localResourceRoots: [vscode.Uri.file(path.join(this._context.extensionPath, WebviewPanel.angularBuildFolder))]
			}
		);

		this._webviewPanel.webview.html = this._getHtmlForWebview(this._webviewPanel.webview);

		this._setWebviewListeners();
	}

	private _updateWebviewPanel(document: vscode.TextDocument): void {
		this._webviewPanel.webview.postMessage({
			type: 'update',
			text: document.getText(),
		});
	}

	private _setWebviewListeners(): void {
		const changeDocumentSubscription = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
			if (document.uri.toString() === this._document.uri.toString()) {
				// @TODO Loading HTML
				vscode.commands.executeCommand('angularpreview.initAngular');
			}
		});

		this._webviewPanel.onDidDispose(() => changeDocumentSubscription.dispose());
	}
}