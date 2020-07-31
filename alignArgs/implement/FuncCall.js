var FuncCall = (function () {
    function FuncCall(indent, funcName, args, comment) {
        this.comment = "";
        this.indent = indent;
        this.funcName = funcName;
        this.args = args;
        if (comment) {
            this.comment = comment;
        }
    }
    return FuncCall;
})();
