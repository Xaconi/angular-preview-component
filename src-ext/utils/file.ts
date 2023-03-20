// Models
import InputData from "../models/inputData";

// Utils
import { REGEX_CLASSNAME,
    REGEX_INPUTS_NAME, 
    REGEX_INPUTS_TESTS, 
    REGEX_INPUTS_TESTS_GLOBAL, 
    REGEX_INPUTS_UNION,
    REGEX_SELECTOR } from "./regex";
import { isPrimitiveType, isUnionType } from "./types";

export function getClassName(data: string): string {
    const matches = data.match(REGEX_CLASSNAME);
    const className: string = matches![1]!;
    return className;
}

export function getSelector(data: string): string {
    const matches = data.match(REGEX_SELECTOR);
    const selector: string = matches![1]!;
    return selector;
}

export function getInputs(data: string): Array<InputData> {
    // Primitives
    const matches = data.match(REGEX_INPUTS_TESTS_GLOBAL);
    const inputs: Array<InputData> = []; 
    matches?.forEach(match => {
        const matchesInput = match.match(REGEX_INPUTS_TESTS);
        const inputType = matchesInput[6];
        if(isPrimitiveType(inputType)) inputs.push({ name: matchesInput[4], type: matchesInput[6] });
        else if(isUnionType(inputType)) {
            const matchesInputName = match.match(REGEX_INPUTS_NAME);
            const matchesInputUnion = match.match(REGEX_INPUTS_UNION).map(matchUnionItem => matchUnionItem.replaceAll("'", ""));
            inputs.push({ name: matchesInputName[4], type: matchesInputUnion.join(' | ') });
        }
        else {
            // Custom object
            inputs.push({ name: matchesInput[4], type: 'any' });
        }
    });
    return inputs;
}

export function getInputsString(componentInputs: Array<InputData>, componentVar: string): string {
	const componentInputsText: Array<string> = componentInputs.map((componentInput: InputData) => `[${componentInput.name}]="${componentVar}.${componentInput.name}"`);
    return componentInputsText.join(" ");
}

export function getInputsProps(componentInputs: Array<InputData>): string {
    let comma = ",";
    const componentInputsProps: Array<string> = [];
    componentInputs.forEach((componentInputsProp: InputData, index: number) => {
        switch(componentInputsProp.type) {
            case 'string':
            case 'String':
            case 'number':
            case 'Number':
            case 'Boolean':
            case 'boolean':
            case 'any':
                if(index === (componentInputs.length - 1)) comma = "";
                componentInputsProps.push(`${componentInputsProp.name}?: ${componentInputsProp.type}${comma}`);
                break;
            default:
                if(index === (componentInputs.length - 1)) comma = "";
                componentInputsProps.push(`${componentInputsProp.name}?: any${comma}`);
                break;
        }
    });
    return componentInputsProps.join('');
}

export function getInputsPropsValues(componentInputs: Array<InputData>): string {
    let comma = ",";
    const componentInputsProps: Array<string> = [];
    componentInputs.forEach((componentInputsProp: InputData, index: number) => {
        switch(componentInputsProp.type) {
            case 'string':
            case 'String':
                componentInputsProps.push(`${componentInputsProp.name}: '',`);
                break;
            case 'number':
            case 'Number':
                componentInputsProps.push(`${componentInputsProp.name}: 0,`);
                break;
            case 'Boolean':
            case 'boolean':
                componentInputsProps.push(`${componentInputsProp.name}: false,`);
                break;
            case 'any':
                componentInputsProps.push(`${componentInputsProp.name}: {},`);
                break;
            default:
                // Union types
                componentInputsProps.push(`${componentInputsProp.name}: null,`);
                break;
        }
    });
    return componentInputsProps.join('');
}

export function getInputsPropsTypes(componentInputs: Array<InputData>): string {
    const componentInputsPropsTypes: Array<{ key: string, type: string }> = [];
    componentInputs.forEach((componentInputsProp: InputData, index: number) => {
        switch(componentInputsProp.type) {
            case 'string':
            case 'String':
                componentInputsPropsTypes.push({ key: componentInputsProp.name, type: 'string' });
                break;
            case 'number':
            case 'Number':
                componentInputsPropsTypes.push({ key: componentInputsProp.name, type: 'number' });
                break;
            case 'Boolean':
            case 'boolean':
                componentInputsPropsTypes.push({ key: componentInputsProp.name, type: 'boolean' });
                break;
            case 'any':
                componentInputsPropsTypes.push({ key: componentInputsProp.name, type: 'any' });
                break;
            default:
                // Union types
                componentInputsPropsTypes.push({ key: componentInputsProp.name, type: `${componentInputsProp.type}` });
                break;
        }
    });
    let componentInputsPropsTypesString: string = '';
    componentInputsPropsTypes.forEach(componentInputsPropsTypesItem => {
        componentInputsPropsTypesString += JSON.stringify(componentInputsPropsTypesItem) + ",";
    })
    return `[${componentInputsPropsTypesString}]`;
}