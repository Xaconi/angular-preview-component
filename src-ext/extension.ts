// Core
import * as vscode from 'vscode';

// Editor
import { ComponentPreviewEditorProvider } from './editors/componentPreviewEditor';

// Utils
import { infoMessage } from './utils';

export function activate(context: vscode.ExtensionContext) {

	infoMessage('Angular Preview started');

	let angularPreviewCommand = vscode.commands.registerCommand('angularpreview.setAngularPreview', () => {
		vscode.window.showInformationMessage('disney classic movies!');
	});

	context.subscriptions.push(angularPreviewCommand);
	context.subscriptions.push(ComponentPreviewEditorProvider.register(context));

	context.subscriptions.push(vscode.commands.registerCommand('angularpreview.initAngular', () => {
		infoMessage('Gonna try npm start');
		const path = context.extensionPath.split("\\").join("\\\\");
		const terminal = vscode.window.createTerminal(`Angular Preview Terminal`);
		terminal.sendText(`cd ${path}`);
		terminal.sendText(`pwd`);
		terminal.sendText(`ng build --configuration production --output-hashing none`);
	}));
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
