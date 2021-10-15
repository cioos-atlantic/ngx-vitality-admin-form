/**
 * Custom Error for features that have not been implemented in the form.
 */
 class NotImplemented extends Error {
    constructor (message?: string) {
        super(message);
        this.message = message + " has not yet been implemented.";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export default NotImplemented