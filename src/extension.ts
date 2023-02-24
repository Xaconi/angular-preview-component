// Core
import * as vscode from 'vscode';

// Editor
import { ComponentPreviewEditorProvider } from './editors/componentPreviewEditor';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "angularpreview" is now active!');

	let angularPreviewCommand = vscode.commands.registerCommand('angularpreview.setAngularPreview', () => {
		vscode.window.showInformationMessage('disney classic movies!');
	});

	context.subscriptions.push(angularPreviewCommand);
	context.subscriptions.push(ComponentPreviewEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
