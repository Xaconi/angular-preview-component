// Core
import * as vscode from 'vscode';
import * as fs from 'fs';

// Utils
import { infoMessage, replaceLine } from '../utils/utils';
import { getClassName } from '../utils/file';

export default class Component {
    private static readonly importHook = '@APComponentImport';
	private static readonly declarationHook = '@APComponentDeclaration';
    private static buildTaskSuscription: vscode.EventEmitter<void>;
    private static context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>) {
        Component.buildTaskSuscription = buildTaskSuscription;
        Component.context = context;

        return this;
    }

    public init(document: vscode.TextDocument): void {
        this._copyFiles(document);
        this._updateAppModuleFile(document);

        Component.buildTaskSuscription.event(() => {
			this._resetAppModuleFile();
		});
    }

    private _copyFiles(document: vscode.TextDocument): void {
		const fileNameComponent = document.fileName.split('\\').at(-1)!;
		const cssFileNameComponent = fileNameComponent.replace(".ts", ".css");
		const htmlFileNameComponent = fileNameComponent.replace(".ts", ".html");
		const scssFileNameComponent = fileNameComponent.replace(".ts", ".scss");

		const tsFileNameComponentPath = document.fileName;
		const cssFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".css");
		const htmlFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".html");
		const scssFileNameComponentPath = tsFileNameComponentPath.replace(".ts", ".scss");

		infoMessage('Copy files');
		if(fs.existsSync(tsFileNameComponentPath)) fs.copyFileSync(tsFileNameComponentPath, `${Component.context.extensionPath}\\src\\component\\${fileNameComponent}`);
		if(fs.existsSync(cssFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".css"), `${Component.context.extensionPath}\\src\\component\\${cssFileNameComponent}`);
		if(fs.existsSync(htmlFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".html"), `${Component.context.extensionPath}\\src\\component\\${htmlFileNameComponent}`);
		if(fs.existsSync(scssFileNameComponentPath)) fs.copyFileSync(document.fileName.replace(".ts", ".scss"), `${Component.context.extensionPath}\\src\\component\\${scssFileNameComponent}`);
	}

    private _updateAppModuleFile(document: vscode.TextDocument): void {
		const fileNameComponentPath = document.fileName.split('\\').at(-1)!;
		const fileNameComponent = fileNameComponentPath.replace('.ts', '');

		let appModuleText: string = fs.readFileSync(`${Component.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		let componentText: string = fs.readFileSync(`${document.fileName}`).toString();

		const className = getClassName(componentText);
		const appModuleComponentImport: string = `import { ${className} } from '../component/${fileNameComponent.replace('.ts', '')}';`;
		appModuleText = replaceLine(appModuleText, Component.importHook, `/* @APComponentImport */ ${appModuleComponentImport}`)
		appModuleText = replaceLine(appModuleText, Component.declarationHook, `/* @APComponentDeclaration */ ${className}`)
		fs.writeFileSync(`${Component.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}

	private _resetAppModuleFile(): void {
		let appModuleText: string = fs.readFileSync(`${Component.context.extensionPath}\\src\\app\\app.module.ts`).toString();
		appModuleText = replaceLine(appModuleText, Component.importHook, `/* @APComponentImport */`)
		appModuleText = replaceLine(appModuleText, Component.declarationHook, `/* @APComponentDeclaration */`)
		fs.writeFileSync(`${Component.context.extensionPath}\\src\\app\\app.module.ts`, appModuleText);
	}
}