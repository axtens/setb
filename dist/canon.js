"use strict";
if (__.argc < 1) {
    print("Syntax: canon.r8 -- dir");
    exit(1);
}
const path = `${__.arg[0]}\\canonical-data.json`;
if (!$.System.IO.File.Exists(path)) {
    print(`${path} not found`);
    exit(1);
}
const data = JSON.parse(slurp(path));
const lines = [];
const exercise = data.exercise;
const cases_cases = data.cases.filter(c => c.cases).length > 0;
if (cases_cases) {
    print("No section handling yet");
    exit(1);
}
data.cases.forEach(kase => {
    lines.push(`[${exercise}-${kase.description}]`);
    lines.push(`uuid=${kase.uuid}`);
    lines.push(`name=${kase.description}`);
    if (kase.property)
        lines.push(`property=${kase.property}`);
    const inputs = kase.input;
    const inputkeys = Object.keys(inputs);
    inputkeys.forEach(key => {
        lines.push(`input.${key}=${express(kase.input[key])}`);
    });
    lines.push(`expected=${express(kase.expected)}`);
    lines.push(`lastTest=0`);
    lines.push('');
});
spit(`${exercise}.ini`, lines.join("\n"));
function express(x) {
    switch (typeof x) {
        case "boolean": return x ? '1' : '0';
        //case "number": return `${x}`;
        case "string": return x.replace(/\r\n|\r|\n/g, "\\n");
        case "object": {
            if (x instanceof Array)
                return x.map(e => express(e)).join(",");
            else if (x !== null)
                return objectify(x);
            else
                return "";
        }
        default: return x;
    }
}
function objectify(o) {
    const answer = [];
    const keys = Object.keys(o);
    keys.forEach(key => {
        answer.push(`${key}=${o[key]}`);
    });
    return answer.join(",");
}
