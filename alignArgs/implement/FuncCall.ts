export class FuncCall {
    indent: string;
    funcName: string;
    args: string[];
    comment = "";
    constructor(indent: string, funcName: string, args: string[], comment?: string) {
        this.indent = indent;
        this.funcName = funcName;
        this.args = args;
        if(comment) {this.comment = comment;}
    }
}