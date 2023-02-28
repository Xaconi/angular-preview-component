// Core
import * as vscode from 'vscode';

// Editor
import { ComponentPreviewEditorProvider } from './editors/componentPreviewEditor';

// Utils
import { errorMessage, infoMessage } from './utils/utils';

export async function activate(context: vscode.ExtensionContext) {

	infoMessage('Angular Preview started');

	let angularPreviewCommand = vscode.commands.registerCommand('angularpreview.setAngularPreview', () => {
		vscode.window.showInformationMessage('disney classic movies!');
	});

	const componentPreviewEditorProvider: ComponentPreviewEditorProvider = new ComponentPreviewEditorProvider(context);
	const buildTaskEnd: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	context.subscriptions.push(angularPreviewCommand);
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

	context.subscriptions.push(vscode.commands.registerCommand('angularpreview.initAngular', async () => {
		const path = context.extensionPath.split("\\").join("\\\\\\");
		
		const tasks: Array<vscode.Task> = await vscode.tasks.fetchTasks();
		const taskBuildAngular: vscode.Task = tasks.find((task: vscode.Task) => task.name === 'build-angular')!;
		

        vscode.tasks.onDidEndTask(e => {
            if (e.execution.task.name === 'build-angular') buildTaskEnd.fire();
        });
		
		try {
			infoMessage('Gonna try build-angular');
			await vscode.tasks.executeTask(taskBuildAngular);
		} catch(error: any) {
			errorMessage(`ERROR  ON TASK EXECUTION ${error}`);
		}
	}));
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
