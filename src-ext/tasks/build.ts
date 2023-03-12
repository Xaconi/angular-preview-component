// Core
import * as vscode from 'vscode';

const addBuildTask = (context: vscode.ExtensionContext) => vscode.tasks.registerTaskProvider('mytask', {
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

export default addBuildTask;