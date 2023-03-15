// Core
import * as vscode from 'vscode';

// Commands
import initAngular from './commands/initAngular';
import updateAngular from './commands/updateAngular';

// Panels
import { WebviewPanel } from './panels/webviewPanel';
import addBuildTask from './tasks/build';

// Utils
import { infoMessage } from './utils/utils';

export async function activate(context: vscode.ExtensionContext) {

	infoMessage('Angular Preview started');
	const buildTaskEnd: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	const webviewPanel: WebviewPanel = new WebviewPanel();

	addBuildTask(context);

	context.subscriptions.push(vscode.commands.registerCommand('angularpreview.initAngular', () => {
		webviewPanel.init(context, buildTaskEnd);
		initAngular(context, buildTaskEnd);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('angularpreview.updateAngular', () => {
		webviewPanel.update(context);
		updateAngular(context, buildTaskEnd);
	}));
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
