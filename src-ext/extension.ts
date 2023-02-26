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
}

// This method is called when your extension is deactivated
export function deactivate() {}
