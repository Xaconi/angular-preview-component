// Core
import * as vscode from 'vscode';
import * as fs from 'fs';

// Utils
import { infoMessage, replaceLine } from '../utils/utils';
import { getClassName, getInputs, getInputsProps, getInputsPropsTypes, getInputsPropsValues, getInputsString, getSelector } from '../utils/file';

// Modles
import InputData from '../models/inputData';

export default class Component {
    private static readonly importHook = '/* @APComponentImport */';
	private static readonly declarationHook = '/* @APComponentDeclaration */';
	private static readonly propsHook = '/* @APComponentProps */';
	private static readonly propsTypesHook = '/* @APComponentPropsTypes */';
	private static readonly htmlHook = '<!-- @APComponentHTML -->';
	private static readonly componentVar = 'componentProps';
	private static readonly componentVarTypes = 'componentPropsTypes';

    private static buildTaskSuscription: vscode.EventEmitter<void>;
    private static context: vscode.ExtensionContext;

	private _appModuleFilePath :string;
	private _appComponentTSFilePath: string;
	private _appComponentHTMLFilePath: string;

    constructor(context: vscode.ExtensionContext, buildTaskSuscription: vscode.EventEmitter<void>) {
        Component.buildTaskSuscription = buildTaskSuscription;
        Component.context = context;

		this._appModuleFilePath = `${Component.context.extensionPath}\\src\\app\\app.module.ts`;
		this._appComponentTSFilePath = `${Component.context.extensionPath}\\src\\app\\app.component.ts`;
		this._appComponentHTMLFilePath = `${Component.context.extensionPath}\\src\\app\\app.component.html`;

        return this;
    }

    public init(document: vscode.TextDocument): void {
        this._copyFiles(document);
        this._updateAppModuleFile(document);
		this._updateAppComponentFile(document);
		this._updateAppHTMLFile(document);

        Component.buildTaskSuscription.event(() => this._resetFiles());
    }

	public update(document: vscode.TextDocument): void {
        this._copyFiles(document);
        this._updateAppModuleFile(document);
		this._updateAppComponentFile(document);
		this._updateAppHTMLFile(document);
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

		let appModuleText: string = fs.readFileSync(this._appModuleFilePath).toString();
		let componentText: string = fs.readFileSync(`${document.fileName}`).toString();

		const className = getClassName(componentText);
		const appModuleComponentImport: string = `import { ${className} } from '../component/${fileNameComponent.replace('.ts', '')}';`;
		appModuleText = replaceLine(appModuleText, Component.importHook, `${Component.importHook} ${appModuleComponentImport}`)
		appModuleText = replaceLine(appModuleText, Component.declarationHook, `${Component.declarationHook} ${className}`)
		fs.writeFileSync(this._appModuleFilePath, appModuleText);
	}

	private _updateAppComponentFile(document: vscode.TextDocument): void {
		let componentText: string = fs.readFileSync(`${document.fileName}`).toString();
		const componentInputs: Array<InputData> = getInputs(componentText);

		let appComponentText = fs.readFileSync(this._appComponentTSFilePath).toString();
		const componentInputsProps: string = getInputsProps(componentInputs);
		const componentInputsPropsValues: string = getInputsPropsValues(componentInputs);
		const componentInputsPropsTypes: string = getInputsPropsTypes(componentInputs);
		appComponentText = replaceLine(appComponentText, Component.propsHook, `${Component.propsHook} public ${Component.componentVar}: {${componentInputsProps}} = {${componentInputsPropsValues}};`);
		appComponentText = replaceLine(appComponentText, Component.propsTypesHook, `${Component.propsTypesHook} public ${Component.componentVarTypes} = ${componentInputsPropsTypes};`);
		fs.writeFileSync(this._appComponentTSFilePath, appComponentText);
	}

	private _updateAppHTMLFile(document: vscode.TextDocument): void {
		let appModuleText: string = fs.readFileSync(this._appComponentHTMLFilePath).toString();
		
		const componentHTML: string = this._writeComponent(document);
		appModuleText = replaceLine(appModuleText, Component.htmlHook, `${Component.htmlHook} ${componentHTML}`)
		fs.writeFileSync(this._appComponentHTMLFilePath, appModuleText);
	}

	private _resetFiles(): void {
		return;
		let appModuleText: string = fs.readFileSync(this._appModuleFilePath).toString();
		appModuleText = replaceLine(appModuleText, Component.importHook, Component.importHook);
		appModuleText = replaceLine(appModuleText, Component.declarationHook, Component.declarationHook);
		fs.writeFileSync(this._appModuleFilePath, appModuleText);

		let appComponentHTMLText: string = fs.readFileSync(this._appComponentHTMLFilePath).toString();
		appComponentHTMLText = replaceLine(appComponentHTMLText, Component.htmlHook, Component.htmlHook);
		fs.writeFileSync(this._appComponentHTMLFilePath, appComponentHTMLText);

		let appComponentTsText: string = fs.readFileSync(this._appComponentTSFilePath).toString();
		appComponentTsText = replaceLine(appComponentTsText, Component.propsHook, `${Component.propsHook} public ${Component.componentVar};`);
		appComponentTsText = replaceLine(appComponentTsText, Component.propsTypesHook, `${Component.propsTypesHook} public ${Component.componentVarTypes};`);
		fs.writeFileSync(this._appComponentTSFilePath, appComponentTsText);
	}
	
	private _writeComponent(document: vscode.TextDocument): string {
		let componentText: string = fs.readFileSync(`${document.fileName}`).toString();
		const componentSelector: string  = getSelector(componentText);

		const componentInputs: Array<InputData> = getInputs(componentText);
		const inputsText: string = getInputsString(componentInputs, Component.componentVar);

		return `<${componentSelector} ${inputsText}></${componentSelector}>`;
	}
}
