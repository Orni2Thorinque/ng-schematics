export function printStringArray(inputs: Array<string>, ): string {
    const items = inputs.map(input => `'${input}'`).join(',');
    return `[${items}]`;
}