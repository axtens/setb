mktest1();

function argparse() {
    const keys = [];
    const names = [];
    for (let i = 0; i < __.argc; i++) {
        const kvp = __.args(i);
        if (kvp.substring(0, 1) === "/")
            keys.push(kvp);
        else names.push(kvp);
    }
    return { keys, names }
}

function mktest1() {
    if (__.argc === 0) {
        print("Usage: mktest <filename>");
        exit(1);
    }
    const parsed = argparse();
    const filename = parsed.names[0];
    const output = parsed.names[1] ?? "test.sno";
    if (parsed.keys.includes("/debug")) debugger;
    print(`Using canonical data: ${filename}`);
    const JObject = JSON.parse(slurp(filename));
    const exercise = JObject["exercise"];
    const cases = JObject["cases"];
    if (JObject.cases.cases) {
        print("Embedded cases. Skipping...");
    }
    const snofile = [];
    snofile.push('-include \'bq.sno\'');
    snofile.push(' define(\'get_working_directory()tmp\')	:(get_working_directory.end)')
    snofile.push('get_working_directory	tmp = bq("pwd")')
    snofile.push(' tmp = reverse(tmp)')
    snofile.push(' tmp ? break(\'/\') . tmp')
    snofile.push(' get_working_directory = reverse(tmp)	:(return)')
    snofile.push('get_working_directory.end')
    //snofile.push('  define(\'script_sucker(script,exitlabel)codeblock,unit,line\') :(script_sucker.end)');
    snofile.push('  define(\'script_sucker(script)codeblock,unit,line\') :(script_sucker.end)');
    snofile.push('script_sucker');
    snofile.push(' codeblock = \'\'');
    snofile.push(' unit = io_findunit()');
    snofile.push(' input(.file, unit, , script) :f(script_sucker.fail)');
    snofile.push('script_sucker.loop');
    snofile.push(' line = file :f(script_sucker.done)');
    snofile.push(` line pos(0) 'END' rpos(0) :s(script_sucker.loop)`);
    snofile.push(' codeblock = codeblock line \';\' :(script_sucker.loop)');
    snofile.push('script_sucker.done');
    snofile.push(' endfile(file)');
    snofile.push(' detach(.file)');
    //snofile.push('  script_sucker = codeblock \' :(\' exitlabel \');\' :(return)');
    snofile.push('  script_sucker = codeblock :(return)');
    snofile.push('script_sucker.fail');
    snofile.push(' output = script \' not found\' :(freturn)');
    snofile.push('script_sucker.end ');
    snofile.push(' test.count = 0');
    snofile.push(' fail.count = 0');
    snofile.push(' pass.count = 0')
    snofile.push(' define(\'compare_and_report(testname,result,expected)lhs,rhs,bhs\') :(compare_and_report.end)');
    snofile.push('compare_and_report');
    snofile.push(' test.count = test.count + 1');
    snofile.push(' datatype(result) len(1) . lhs');
    snofile.push(' datatype(expected) len(1) . rhs');
    snofile.push(' bhs = \'compare_and_report.\' lhs rhs');
    snofile.push(' :($bhs)');
    snofile.push('compare_and_report.is');
    snofile.push(' eq(result, 0 + expected) :s(compare_and_report.pass)f(compare_and_report.fail)');
    snofile.push('compare_and_report.si');
    snofile.push(' eq(0 + result, expected) :s(compare_and_report.pass)f(compare_and_report.fail)');
    snofile.push('compare_and_report.ii');
    snofile.push(' eq(result, expected) :s(compare_and_report.pass)f(compare_and_report.fail)');
    snofile.push('compare_and_report.ss');
    snofile.push(' compare_and_report = ident(result, expected) :s(compare_and_report.pass)f(compare_and_report.fail)');
    snofile.push('compare_and_report.pass');
    snofile.push(' pass.count = pass.count + 1');
    snofile.push(' compare_and_report = testname \' ... OK\' :(return)');
    snofile.push('compare_and_report.fail');
    snofile.push(' fail.count = fail.count + 1');
    snofile.push(' compare_and_report = testname \' ... FAIL\' :(return)');
    snofile.push(' ');
    snofile.push('compare_and_report.end');

    snofile.push(` corecode = script_sucker('./${exercise}.sno') :f(end)`)

    cases.forEach((testcase: any, i: number) => {
        const description = testcase["description"];
        const uuid = testcase["uuid"];
        const property = testcase["property"];
        const inputKeys = Object.keys(testcase["input"]);
        const expected = testcase["expected"];
        // print(`Test case: ${description}`);
        // print(`  UUID: ${uuid}`);
        // print(`  Property: ${property}`);
        // print(`  Inputs: ${JSON.stringify(inputs)}`);
        // print(`  Expected: ${expected}`);
        // snofile.push(`test.${i}`)
        snofile.push(`* ${description}`);
        snofile.push(` codeblock = corecode \' :(test.${i + 1}) ;\'`)
        snofile.push(` compiled = code(codeblock)`);
        inputKeys.forEach(key => {
            snofile.push(` input.${key} = ${render(testcase.input[key])}`)
        })
        snofile.push(` :<compiled>`);
        snofile.push(`test.${i + 1}`);
        snofile.push(` expected = ${render(expected)}`)
        snofile.push(` output = compare_and_report(\'${description}\',result, expected)`)

    });
    snofile.push('tests_done');
    snofile.push(' output = test.count " tests. " pass.count " passes, " fail.count " failure."');
    snofile.push('END')
    spit(output, snofile.join("\n"))
}

function render(o: any): any {
    if ("boolean" === typeof o) return o ? 1 : 0;
    if ("string" === typeof o) {
        if (o.includes('"')) return "'" + o + "'";
        if (o.includes("'")) return '"' + o + '"';
        return "'" + o + "'";    
    }
    return o;
}

declare function spit(arg0: string, arg1: string): void;

