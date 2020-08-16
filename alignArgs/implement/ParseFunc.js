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
    var args = [];
    var comment = '';
    var argIndex = -1;
    var curr;
    var state = STATE.INDENT;
    for (var i = 0; i < line.length; i++) {
        curr = line.charAt(i);
        switch (state) {
            case STATE.INDENT:
                if (curr.match(/\s/)) { // whitespace
                    indent += curr;
                }
                else if (curr.match(/[a-zA-Z_]/)) { // first character of identifier (alphabet, underscore)
                    funcName = curr;
                    state = STATE.FUNC_NAME;
                }
                else {
                    state = STATE.FAIL;
                }
                break;
            case STATE.FUNC_NAME:
                if (curr.match(/[\w_]/)) { // alphanumeric, underscore
                    funcName += curr;
                }
                else if (curr.match(/\s/)) { // whitespace
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
                else if (curr.match(/\S/)) { // non-whitespace
                    state = STATE.FAIL;
                }
                break; // ignore whitespace
            case STATE.ARG_START:
                if (curr.match(/[\w\&\*]/)) { // alphanumeric, ampersand, asterisk
                    args[++argIndex] = curr;
                    state = STATE.ARG_MIDDLE;
                }
                else if (curr === ')') {
                    state = STATE.COMMENT_START;
                }
                else if (curr.match(/\S/)) { // non-whitespace\
                    state = STATE.FAIL;
                }
                break; // ignore whitespace
            case STATE.ARG_MIDDLE:
                if (curr.match(/[\w_]/)) { // alphanumeric, underscore
                    args[argIndex] += curr;
                }
                else if (curr === ',') {
                    state = STATE.ARG_START;
                }
                else if (curr.match(/\s/)) { // whitespace
                    args[argIndex] += curr;
                    state = STATE.ARG_END;
                }
                else if (curr === ')') {
                    state = STATE.COMMENT_START;
                }
                else {
                    state = STATE.FAIL;
                }
                break;
            case STATE.ARG_END:
                if (curr === ',') {
                    state = STATE.ARG_START;
                }
                else if (curr === ')') {
                    state = STATE.COMMENT_START;
                }
                else if (curr.match(/\s/)) { // whitespace
                    args[argIndex] += curr;
                }
                else {
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
                else if (curr.match(/\S/)) {
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

    if (state === STATE.DONE || state === STATE.ARG_START || state === STATE.ARG_MIDDLE || state === STATE.ARG_END || state === STATE.COMMENT_START || state === STATE.COMMENT)  
        return new FuncCall(indent, funcName, args, comment);
    else {
        return new FuncCall('', '', [], '');
    }
    /*
    if (state === STATE.DONE && argIndex !== -1) {
        return new FuncCall(indent, funcName, args, comment);
    }
    else {
        return new FuncCall('', '', [], '');
    }
    */
}
