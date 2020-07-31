export class AlignArgs {

    static Do(linesRaw: string): string {
        var lines = linesRaw.split(/\r?\n/);
        var parsedLines: FuncCall[] = [];
        var maxArgWidthArr = [0];
        var minIndentWidth = Infinity;
        var maxFuncNameWidth = 0;

        lines.forEach(function (line, index) {

            parsedLines[index] = parseFunc.ParseFunc(line);

            if (parsedLines[index].funcName !== '') {
                if (parsedLines[index].indent.length < minIndentWidth) {
                    minIndentWidth = parsedLines[index].indent.length;
                }

                if (parsedLines[index].funcName.length > maxFuncNameWidth) {
                    maxFuncNameWidth = parsedLines[index].funcName.length;
                }

                maxArgWidthArr = calcMaxArgWidthArr(maxArgWidthArr, parsedLines[index].args.map((arg) => arg.length));
            }
        });

        var outputString = "";

        parsedLines.forEach(function (line, index) {
            if (line.funcName === '') {
                outputString += lines[index];
            } else {
                line.args = line.args.map((arg, index) => arg.padEnd(maxArgWidthArr[index], ' '));
                outputString += ' '.repeat(minIndentWidth) + line.funcName.padEnd(maxFuncNameWidth) + '(' + line.args.join(' , ') + ' );' + line.comment;
            }

            outputString += '\r\n';
        });
        return outputString.slice(0, -2);
    }
}

function calcMaxArgWidthArr(args1: number[], args2: number[]): number[] {

    var argWidthArr: number[] = [];

    var arg1Length: number;
    var arg2Length: number;

    var index = 0;

    while (args1[index] || args2[index]) {

        arg1Length = args1[index] ? args1[index] : 0;
        arg2Length = args2[index] ? args2[index] : 0;

        if (arg1Length > arg2Length) {
            argWidthArr[index] = arg1Length;
        } else {
            argWidthArr[index] = arg2Length;
        }
        index++;
    }

    return argWidthArr;
}
