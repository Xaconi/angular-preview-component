// Core
import * as vscode from 'vscode';
import initAngular from './commands/initAngular';

// Editor
import { ComponentPreviewEditorProvider } from './editors/componentPreviewEditor';

// Utils
import { errorMessage, infoMessage } from './utils/utils';

export async function activate(context: vscode.ExtensionContext) {

	infoMessage('Angular Preview started');
	const componentPreviewEditorProvider: ComponentPreviewEditorProvider = new ComponentPreviewEditorProvider(context);
	const buildTaskEnd: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	context.subscriptions.push(componentPreviewEditorProvider.register(context, buildTaskEnd));

	vscode.tasks.registerTaskProvider('mytask', {
		provideTasks: () => {
			const path = context.extensionPath.split("\\").join("/");
			const tasks: Array<vscode.Task> = [
				new vscode.Task (
				{type: 'shell'},
				vscode.workspace?.workspaceFolders![0],
				'build-angular',
				'BuildAngular',
				new vscode.ShellExecution(`pwd && cd ${path} && npm run build-angular`),
				["mywarnings"]
			)];
			return tasks;
		},
		resolveTask(_task: vscode.Task): vscode.Task | undefined {
			// as far as I can see from the documentation this just needs to return undefined.
			return _task;
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('angularpreview.initAngular', () => initAngular(context, buildTaskEnd)));
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
