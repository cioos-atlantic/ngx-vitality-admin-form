/**
 * Custom Error for features that have not been implemented in the form.
 */
 class NotImplemented extends Error {
    constructor (message = "", ...args) {
        super(message, ...args);
        this.message = message + " has not yet been implemented.";
    }
}