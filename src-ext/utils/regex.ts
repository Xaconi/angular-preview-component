export const REGEX_CLASSNAME = /export class ([a-zA-Z]+)/;
export const REGEX_SELECTOR = /selector:[ ]?'(.+)'/;
export const REGEX_INPUTS = /@Input\((.+)?\) (public )?(private )?(.[^ ]+)(:| :)[ ]?(string|number|boolean|String|Number|Boolean)[;]?/;
export const REGEX_INPUTS_GLOBAL = /@Input\((.+)?\) (public )?(private )?(.[^ ]+)(:| :)[ ]?(string|number|boolean|String|Number|Boolean)[;]?/g;
export const REGEX_INPUTS_UNION_GLOBAL = /@Input\((.+)?\) (public )?(private )?(.[^ :]+)(:| :)?[ ]?(([ ]?[|]?[ ]?'.[^ ]+'[ ]?[;]?)+)+/g;
export const REGEX_INPUTS_NAME = /@Input\((.+)?\) (public )?(private )?(.[^ ]+)(:| :)/;
export const REGEX_INPUTS_UNION = /'(.[^ ]+)'/g;