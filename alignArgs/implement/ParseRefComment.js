var STATE_REF;
(function (STATE_REF) {
    STATE_REF[STATE_REF["INDENT"] = 0] = "INDENT";
    STATE_REF[STATE_REF["CHECK_COMMENT"] = 1] = "CHECK_COMMENT";
    STATE_REF[STATE_REF["ARG_START"] = 2] = "ARG_START";
    STATE_REF[STATE_REF["ARG_MIDDLE"] = 3] = "ARG_MIDDLE";
    STATE_REF[STATE_REF["ARG_END"] = 4] = "ARG_END";
    STATE_REF[STATE_REF["DONE"] = 5] = "DONE";
    STATE_REF[STATE_REF["FAIL"] = 6] = "FAIL";
})(STATE_REF || (STATE_REF = {}));
function ParseRefComment(line) {
    var curr;
    var state = STATE_REF.INDENT;
    var indent = '';
    var args = [];
    var argIndex = -1;
    for (var i = 0; i < line.length; i++) {
        curr = line.charAt(i);
        switch (state) {
            case STATE_REF.INDENT:
                if (curr.match(/\s/)) { // whitespace
                    indent += curr;
                }
                else if (curr === '/') {
                    state = STATE_REF.CHECK_COMMENT;
                }
                else {
                    state = STATE_REF.FAIL;
                }
                break;
            case STATE_REF.CHECK_COMMENT:
                if (curr === '/' || curr === '*') {
                    state = STATE_REF.ARG_START;
                }
                else {
                    state = STATE_REF.FAIL;
                }
                break;
            case STATE_REF.ARG_START:
                if (curr.match(/\w/)) { // alphanumeric
                    args[++argIndex] = curr;
                    state = STATE_REF.ARG_MIDDLE;
                }
                else if (curr.match(/[\s(]/)) { // ignore whitespace and '('
                    // Do nothing
                }
                else {
                    state = STATE_REF.FAIL;
                }
                break;
            case STATE_REF.ARG_MIDDLE:
                if (curr.match(/[\w_]/)) { // alphanumeric, underscore
                    args[argIndex] += curr;
                }
                else if (curr.match(/\s/)) { // whitespace
                    state = STATE_REF.ARG_END;
                }
                else if (curr === ',') {
                    state = STATE_REF.ARG_START;
                }
                else if (curr === '*') {
                    // comment end;
                }
                break;
            case STATE_REF.ARG_END:
                if (curr === ',') {
                    state = STATE_REF.ARG_START;
                }
                else if (curr.match(/\s/)) {
                    // ignore whitespace
                }
                break;
        }
    }
    if (argIndex === 0) {
        return [];
    }
    else {
        return args;
    }
}
