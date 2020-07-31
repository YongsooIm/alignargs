import { FuncCall } from "./FuncCall";

enum STATE {
    INDENT,
    FUNC_NAME,
    FUNC_NAME_END,
    ARG_START,
    ARG_MIDDLE,
    ARG_END,
    COMMENT_START,
    COMMENT,
    DONE,
    FAIL,
}

export function ParseFunc(line: string): FuncCall {

    let indent = '';
    let funcName = '';
    let args = [''];
    let comment = '';
    let argIdx = 0;
    let curr: string;
    let state = STATE.INDENT;

    for (let i = 0; i < line.length; i++) {
        curr = line.charAt(i);

        switch (state) {
            case STATE.INDENT:
                if (curr.match(/\s/)) {
                    indent += curr;
                } else if (curr.match(/[a-zA-Z_]/)) {
                    funcName += curr;
                    state = STATE.FUNC_NAME;
                } else {
                    state = STATE.FAIL;
                } break;

            case STATE.FUNC_NAME:
                if (curr.match(/[a-zA-Z_1-9]/)) {
                    funcName += curr;
                } else if (curr.match(/\s/)) {
                    state = STATE.FUNC_NAME_END;
                } else if (curr === '(') {
                    state = STATE.ARG_START;
                } else {
                    state = STATE.FAIL;
                } break;

            case STATE.FUNC_NAME_END:
                if (curr === '(') {
                    state = STATE.ARG_START;
                } else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                } break;

            case STATE.ARG_START:
                if (curr.match(/[a-zA-Z_]/)) {
                    args[argIdx] += curr;
                    state = STATE.ARG_MIDDLE;
                } else if (curr === ')') {
                    state = STATE.COMMENT_START;
                } else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                } break;

            case STATE.ARG_MIDDLE:
                if (curr.match(/[a-zA-Z_1-9]/)) {
                    args[argIdx] += curr;
                } else if (curr === ',') {
                    args[++argIdx] = '';
                    state = STATE.ARG_START;
                } else if (curr.match(/\s/)) {
                    state = STATE.ARG_END;
                } else if (curr === ')') {
                    state = STATE.COMMENT_START;
                } else {
                    state = STATE.FAIL;
                } break;

            case STATE.ARG_END:
                if (curr === ',') {
                    if(args[argIdx] === 't' || args[argIdx] === 'T')
                        args[argIdx] = 'TRUE';
                    else if(args[argIdx] === 'f' || args[argIdx] === 'F'){
                        args[argIdx] = 'FALSE';
                    }
                    args[++argIdx] = '';
                    state = STATE.ARG_START;
                } else if (curr === ')'){
                    state = STATE.COMMENT_START;
                } else if (!curr.match(/\s/)) { 
                    state = STATE.FAIL; 
                }
                break;

            case STATE.COMMENT_START:
                if (curr === ';') {
                    if (i === line.length - 1) {
                        state = STATE.DONE;
                    } else {
                        state = STATE.COMMENT;
                    }
                } else if (!curr.match(/\s/)) {
                    state = STATE.FAIL;
                } break;

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

    if (state === STATE.DONE) {
        return new FuncCall(indent, funcName, args, comment);
    } else {
        return new FuncCall('', '', [''], '');
    }
}
