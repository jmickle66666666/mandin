(function() {
    var Undo = {};

    let stack = [];

    function registerAction(name, action, undo, execute = true)
    {
        stack.push({
            name: name,
            action: action,
            undo: undo
        });

        if (execute) action();
    }
    Undo.registerAction = registerAction;

    function undo()
    {
        if (stack.length > 0) {
            let action = stack.pop();
            log("Undo "+action.name);
            action.undo();
        }
    }
    Undo.undo = undo;

    let substackpos = 0;
    function beginSubstack()
    {
        substackpos = stack.length;
    }
    Undo.beginSubstack = beginSubstack;

    function compressSubstack(name)
    {
        let substack = stack.splice(substackpos, stack.length);

        let undos = [];
        let redos = [];
        for (let i = 0; i < substack.length; i++)
        {
            undos.push(substack[i].undo);
            redos.push(substack[i].action);
        }
        undos.reverse();
        redos.reverse();
        stack.push({
            name: name,
            action: () => {
                for (let i = 0; i < redos.length; i++) {
                    redos[i]();
                }
            },
            undo: () => {
                for (let i = 0; i < undos.length; i++) {
                    undos[i]();
                }
            }
        });
    }
    Undo.compressSubstack = compressSubstack;

    window.Undo = Undo;
})();