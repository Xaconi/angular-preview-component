export function getClassName(data: string): string {
    const matches = data.match(/export class ([a-zA-Z]+)[ ]+{/);
    const className: string = matches![1]!;
    return className;
}

export function getSelector(data: string): string {
    const matches = data.match(/selector:[ ]?'(.+)'/);
    const selector: string = matches![1]!;
    return selector;
}