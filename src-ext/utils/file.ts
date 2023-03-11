// Models
import InputData from "../models/inputData";

// Constants
const REGEX_CLASSNAME = /export class ([a-zA-Z]+)[ ]+{/;
const REGEX_SELECTOR = /selector:[ ]?'(.+)'/;
const REGEX_INPUTS = /@Input\((.+)?\) (public )?(private )?(.[^ ]+)(:| :)[ ]?(string|number|boolean|String|Number|Boolean)[;]?/;
const REGEX_INPUTS_GLOBAL = /@Input\((.+)?\) (public )?(private )?(.[^ ]+)(:| :)[ ]?(string|number|boolean|String|Number|Boolean)[;]?/g;

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
    const matches = data.match(REGEX_INPUTS_GLOBAL);
    const inputs: Array<InputData> = []; 
    matches?.forEach(match => {
        const matchesInput = match.match(REGEX_INPUTS);
        if(matchesInput) inputs.push({ name: matchesInput[4], type: matchesInput[6] });
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
                if(index === (componentInputs.length - 1)) comma = "";
                componentInputsProps.push(`${componentInputsProp.name}?: ${componentInputsProp.type}${comma}`);
                break;
            default:
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
            default:
                break;
        }
    });
    return componentInputsProps.join('');
}