/**
 * @overview Exceptions
 * @module exceptions
 *
 * @author Viacheslav Lotsmanov
 * @license GPLv3
 */

var list = [];

function base() {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
}

/** @typedef {Error} ConfigFileIsNotExists */
list.push(function ConfigFileIsNotExists(message, filename) {
    base.call(this);
    this.message = message || 'Config file ' + (
            (filename) ? ('"'+ filename.toString() +'" ') : ''
        ) + 'is not exists.';
});

/** @typedef {Error} IncorrectStylesDirPath */
list.push(function IncorrectStylesDirPath(message) {
    base.call(this);
    this.message = message || 'Incorrect styles dir path.';
});

/** @typedef {Error} StylesDirIsNotExists */
list.push(function StylesDirIsNotExists(message, dir) {
    base.call(this);
    this.message = message || 'Styles dir ' + (
            (dir) ? ('"'+ dir.toString() +'" ') : ''
        ) + 'is not exists.';
});

list.forEach(function (val) {
    module.exports[val.name] = val;
});
