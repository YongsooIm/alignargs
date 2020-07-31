var STATE;
(function (STATE) {
    STATE[STATE["INDENT"] = 0] = "INDENT";
    STATE[STATE["FUNC_NAME"] = 1] = "FUNC_NAME";
    STATE[STATE["FUNC_NAME_END"] = 2] = "FUNC_NAME_END";
    STATE[STATE["ARG_START"] = 3] = "ARG_START";
    STATE[STATE["ARG_MIDDLE"] = 4] = "ARG_MIDDLE";
    STATE[STATE["ARG_END"] = 5] = "ARG_END";
    STATE[STATE["COMMENT_START"] = 6] = "COMMENT_START";
    STATE[STATE["COMMENT"] = 7] = "COMMENT";
    STATE[STATE["DONE"] = 8] = "DONE";
    STATE[STATE["FAIL"] = 9] = "FAIL";
})(STATE || (STATE = {}));
function ParseFunc(line) {
    var indent = '';
    var funcName = '';
    var args = [''];
    var comment = '';
    var argIdx = 0;
    var curr;
    var state = STATE.INDENT;
    for (var i = 0; i < line.length; i++) {
        curr = line.charAt(i);
        switch (state) {
            case STATE.INDENT:
                if (curr.match(/\s/)) {
                    indent += curr;
                }
                else if (curr.match(/[a-zA-Z_]/)) {
                    funcName += curr;
                    state = STATE.FUNC_NAME;
                }
                else {
                    state = STATE.FAIL;
                }
                break;
            case STATE.FUNC_NAME:
                if (curr.match(/[a-zA-Z_1-9]/)) {
                    funcName += curr;
                }
                else if (curr.match(/\s/)) {
                    state = STATE.FUNC_NAME_END;
                }
                else if (curr === '(') {
                    state = STATE.ARG_START;
                }
                else {
                    state = STATE.FAIL;
                }
                break;
            case STATE.FUNC_NAME_END:
                if (curr === '(') {
                    state = STATE.ARG_START;
                }
                else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                }
                break;
            case STATE.ARG_START:
                if (curr.match(/[a-zA-Z_0-9]/)) {
                    args[argIdx] += curr;
                    state = STATE.ARG_MIDDLE;
                }
                else if (curr === ')') {
                    state = STATE.COMMENT_START;
                }
                else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                }
                break;
            case STATE.ARG_MIDDLE:
                if (curr.match(/[a-zA-Z_0-9]/)) {
                    args[argIdx] += curr;
                }
                else if (curr === ',') {
                    if(args[argIdx] === 't' || args[argIdx] === 'T')
                        args[argIdx] = 'TRUE';
                    else if(args[argIdx] === 'f' || args[argIdx] === 'F'){
                        args[argIdx] = 'FALSE';
                    }
                    args[++argIdx] = '';
                    state = STATE.ARG_START;
                }
                else if (curr.match(/\s/)) {
                    state = STATE.ARG_END;
                }
                else if (curr === ')') {
                    if(args[argIdx] === 't' || args[argIdx] === 'T')
                        args[argIdx] = 'TRUE';
                    else if(args[argIdx] === 'f' || args[argIdx] === 'F'){
                        args[argIdx] = 'FALSE';
                    }
                    state = STATE.COMMENT_START;
                }
                else {
                    state = STATE.FAIL;
                }
                break;
            case STATE.ARG_END:
                if(args[argIdx] === 't' || args[argIdx] === 'T')
                    args[argIdx] = 'TRUE';
                else if(args[argIdx] === 'f' || args[argIdx] === 'F'){
                    args[argIdx] = 'FALSE';
                }
                if (curr === ',') {
                    args[++argIdx] = '';
                    state = STATE.ARG_START;
                }
                else if (curr === ')') {
                    state = STATE.COMMENT_START;
                }
                else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                }
                break;
            case STATE.COMMENT_START:
                if (curr === ';') {
                    if (i === line.length - 1) {
                        state = STATE.DONE;
                    }
                    else {
                        state = STATE.COMMENT;
                    }
                }
                else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                }
                break;
            case STATE.COMMENT:
                comment = line.substr(i, line.length);
                state = STATE.DONE;
                break;
            default:
                state = STATE.FAIL;
                break;
        }
        if (state === STATE.DONE || state === STATE.FAIL) {
            break;
        }
    }

    return new FuncCall(indent, funcName, args, comment);

    if (state === STATE.DONE) {
        return new FuncCall(indent, funcName, args, comment);
    }
    else {
        return new FuncCall('', '', [''], '');
    }
}
