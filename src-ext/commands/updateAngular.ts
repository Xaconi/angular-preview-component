// Core
import * as vscode from 'vscode';

// Utils
import { infoMessage, errorMessage } from '../utils/utils';

export default async function updateAngular(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>) {
    const path = context.extensionPath.split("\\").join("\\\\\\");
    
    const tasks: Array<vscode.Task> = await vscode.tasks.fetchTasks();
    const taskBuildAngular: vscode.Task = tasks.find((task: vscode.Task) => task.name === 'build-angular')!;
    
    try {
        infoMessage('Gonna try build-angular');
        await vscode.tasks.executeTask(taskBuildAngular);
    } catch(error: any) {
        errorMessage(`ERROR  ON TASK EXECUTION ${error}`);
    }
}