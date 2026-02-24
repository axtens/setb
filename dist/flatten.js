"use strict";
function flattenSimple(cases) {
    const result = [];
    function recurse(items) {
        for (const item of items) {
            if ('cases' in item) {
                recurse(item.cases);
            }
            else {
                const tc = item;
                result.push({
                    description: tc.description,
                    property: tc.property,
                    sides: tc.input.sides,
                    expected: tc.expected
                });
            }
        }
    }
    recurse(cases);
    return result;
}
// Usage:
// const flat = flattenSimple(data.cases);
