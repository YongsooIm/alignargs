function DoAlign(input, config) {
    var parsedLines = [];
    var maxArgLengthArr = [0];
    var minIndent = ' '.repeat(100);
    var maxFuncNameLength = 0;
    var outputLines = [];
    var findingRefComment = true;
    var lines = input.split(/\r?\n/);
    var parsedRefComment = [];
    var refCommentLineIndex = 0;
    // parsing part
    lines.forEach((line, index) => {
        if (findingRefComment) {
            parsedRefComment = ParseRefComment(line);
            if (parsedRefComment.length !== 0) {
                findingRefComment = false;
                maxArgLengthArr = parsedRefComment.map(arg => arg.length);
                refCommentLineIndex = index;
                outputLines.push('');
                return;
            }
        }
        parsedLines[index] = ParseFunc(line);
        if (parsedLines[index].funcName !== '') {
            findingRefComment = false;
        }
        var currentParsedLine = parsedLines[index];
        if (currentParsedLine.funcName !== '') {
            if (currentParsedLine.indent.length < minIndent.length) {
                minIndent = currentParsedLine.indent;
            }
            if (currentParsedLine.funcName.length > maxFuncNameLength) { // calc max func name
                maxFuncNameLength = currentParsedLine.funcName.length;
            }
            if (config.trimTrail) { // check trim option
                currentParsedLine.args = currentParsedLine.args.map((arg) => arg.trim());
            }
            currentParsedLine.args.forEach((arg, index, args) => {
                if (arg.trim() in config.replace) { // check replace object has key
                    var from = arg.trim();
                    var to = config.replace[from];
                    args[index] = args[index].replace(from, to);
                }
                if (config.formatHex) { // check format hex option
                    var temp = arg.trim().toUpperCase();
                    if (temp.match(/\b0X[0-9A-F]+[Uu]?\b/)) { // check hex expression
                        temp = temp.replace('X', 'x').replace('U', 'u');
                        args[index] = args[index].replace(args[index].trim(), temp);
                    }
                }
            });
            maxArgLengthArr = calcMaxArgLengthArr(maxArgLengthArr, currentParsedLine.args.map((arg) => arg.length));
        }
    });
    // building output part
    var joinStringSpace = ' , ';
    var joinStringTab = ', ';
    parsedLines.forEach(function (line, index) {
        if (line.funcName === '') {
            outputLines.push(lines[index]);
        }
        else {
            line.args = line.args.map((arg, argIndex) => {
                if (config.padType === 'space') { // pad type is space
                    if (config.rightAlignDecimal && !arg.trim().match(/\D/)) { // right align decimal
                        return arg.padStart(maxArgLengthArr[argIndex], ' ');
                    }
                    else {
                        return arg.padEnd(maxArgLengthArr[argIndex], ' ');
                    }
                }
                else { // pad type is tab
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const tabSize = 4;
                    if (argIndex === 0) { // first argument, calculate function name length
                        var targetWidth = Math.ceil((maxFuncNameLength + 1 + maxArgLengthArr[argIndex]) / tabSize) * tabSize;
                        if (config.rightAlignDecimal && !arg.trim().match(/\D/)) { // right align decimal
                            return arg.padStart(targetWidth - maxFuncNameLength - 1, ' ') + '\t';
                        }
                        else {
                            return arg + '\t'.repeat(Math.ceil((targetWidth - arg.length - maxFuncNameLength - 1) / tabSize) + 1);
                        }
                    }
                    else {
                        var targetWidth = Math.ceil(maxArgLengthArr[argIndex] / tabSize) * tabSize; // target width 
                        if (config.rightAlignDecimal && !arg.trim().match(/\D/)) { // right align decimal
                            return arg.padStart(targetWidth, ' ') + '\t';
                        }
                        else {
                            return arg + '\t'.repeat(Math.ceil((targetWidth - arg.length - joinStringTab.length) / 4) + 1); // after second argument 
                        }
                    }
                }
            });
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (config.padType === 'space') {
                outputLines.push(minIndent + line.funcName.padEnd(maxFuncNameLength) + '(' + line.args.join(joinStringSpace) + ');' + line.comment);
            }
            else {
                outputLines.push(minIndent + line.funcName.padEnd(maxFuncNameLength) + '(' + line.args.join(joinStringTab) + ');' + line.comment);
            }
        }
    });
    if (parsedRefComment.length !== 0) {
        outputLines[refCommentLineIndex] = minIndent + '/*' + ' '.repeat(maxFuncNameLength - 1) + parsedRefComment.map((arg, index) => arg.padEnd(maxArgLengthArr[index])).join(' , ')
        .padEnd(minIndent.length + maxFuncNameLength + maxArgLengthArr.reduce((a, b) => a+b, 0), ' ') + '*/';
    }

    return outputLines.join('\r\n');
}

function calcMaxArgLengthArr(args1, args2) {
    var arg1Length;
    var arg2Length;
    var argLengthArr = [];
    var index = 0;
    while (args1[index] || args2[index]) {
        arg1Length = args1[index] ? args1[index] : 0;
        arg2Length = args2[index] ? args2[index] : 0;
        if (arg1Length > arg2Length) {
            argLengthArr[index] = arg1Length;
        }
        else {
            argLengthArr[index] = arg2Length;
        }
        index++;
    }
    return argLengthArr;
}
