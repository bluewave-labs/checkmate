import ivm from 'isolated-vm';

export class TimeoutError extends Error {
    constructor(message) { super(message); }
}

export class UserScriptError extends Error {
    constructor(message, row, col) {
        super(message);
        this.row = row;
        this.col = col;
    }
}

export default async function (code, param) {
    // Create a new isolate limited to 128MB
    const isolate = new ivm.Isolate({ memoryLimit: 128 });

    // Create a new context within this isolate. Each context has its own copy of all the builtin Objects.
    // So for instance if one context does Object.prototype.foo = 1 this would not affect any other contexts.
    const context = isolate.createContextSync();

    // Complete code to be executed by `evalClosure`.
    // Add code to get the argument as the `res`, so that `res` can be used in the user code.
    // Example:
    //   return res.code === 200;
    // No spaces or line breaks, preserve the error location.
    const script =
        `const res = $0;
try {
${code}
} catch (e) {
const lines = e.stack.split("\\n");
const [, row, col] = lines[lines.length - 1].match(/\\sat\\s\\<isolated-vm\\>\\:(\\d)\\:(\\d)/);
throw new Error("UserScriptError:" + row + ":" + col + ":" + e.message);
}
`;

    // Compiles and runs code as if it were inside a function, similar to the seldom-used new Function(code) constructor.
    // The function will return a Promise while the work runs in a separate thread pool.
    // After the timeout, the thread will be automatically terminated, and we do not need to handle it.
    return context.evalClosure(script, [param], { timeout: 1000, arguments: { copy: true } }).catch(e => {
        if (e.message.startsWith('UserScriptError')) {
            // User script error, display error location in user script.
            const [, row, col, ...messages] = e.message.split(':');
            throw new UserScriptError(`UserScriptError: ${messages.join(':')}:${row - 2}:${col}`, row - 2, col);
        } else if (e.message === 'Script execution timed out.') {
            // Timeout
            throw new TimeoutError(e.message);
        } else {
            // Other runtime error
            throw e;
        }
    });
}