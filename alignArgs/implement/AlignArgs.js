var AlignArgs = (function () {
    function AlignArgs() {
    }
    AlignArgs.Do = function (linesRaw) {
        var lines = linesRaw.split(/\r?\n/);
        var parsedLines = [];
        var maxArgWidthArr = [0];
        var minIndentWidth = Infinity;
        var maxFuncNameWidth = 0;
        lines.forEach(function (line, index) {
            parsedLines[index] = ParseFunc(line);
            if (parsedLines[index].funcName !== '') {
                if (parsedLines[index].indent.length < minIndentWidth) {
                    minIndentWidth = parsedLines[index].indent.length;
                }
                if (parsedLines[index].funcName.length > maxFuncNameWidth) {
                    maxFuncNameWidth = parsedLines[index].funcName.length;
                }
                maxArgWidthArr = calcMaxArgWidthArr(maxArgWidthArr, parsedLines[index].args.map(function (arg) { return arg.length; }));
            }
        });
        var outputString = "";
        parsedLines.forEach(function (line, index) {
            if (line.funcName === '') {
                outputString += lines[index];
            }
            else {
                line.args = line.args.map(function (arg, index) { return arg.padEnd(maxArgWidthArr[index], ' '); });
                outputString += ' '.repeat(minIndentWidth) + line.funcName.padEnd(maxFuncNameWidth) + '(' + line.args.join(' , ') + ' );' + line.comment;
            }
            outputString += '\r\n';
        });

        return outputString.slice(0, -2);
    };
    return AlignArgs;
})();

function calcMaxArgWidthArr(args1, args2) {
    var argWidthArr = [];
    var arg1Length;
    var arg2Length;
    var index = 0;
    while (args1[index] || args2[index]) {
        arg1Length = args1[index] ? args1[index] : 0;
        arg2Length = args2[index] ? args2[index] : 0;
        if (arg1Length > arg2Length) {
            argWidthArr[index] = arg1Length;
        }
        else {
            argWidthArr[index] = arg2Length;
        }
        index++;
    }
    return argWidthArr;
}
