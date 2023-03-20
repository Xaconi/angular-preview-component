export const primitiveTypes = ['string', 'String', 'number', 'Number', 'boolean', 'Boolean'];

export function isPrimitiveType(type: string): boolean {
    return primitiveTypes.includes(type);
}

export function isUnionType(type: string): boolean {
    return type.includes("|");
}