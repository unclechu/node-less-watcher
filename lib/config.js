/**
 * @overview Configurations loader and parser
 * @module config
 *
 * @author Viacheslav Lotsmanov
 * @license GPLv3
 */

var fs = require('fs');

// inner modules
var exceptions = require('./exceptions');

/**
 * @constructor
 * @public
 */
function Config(defaultConfig) {
    /** @private */ var self = this;

    /**
     * @public
     * @type {config}
     * @instance
     */
    this.config = {};

    // cloning
    for (var key in defaultConfig) this.config[key] = defaultConfig[key];
}

/**
 * Extend configuration
 * @public
 * @param {config} config
 */
Config.prototype.set
= function set(config) {
    for (var key in config) this.config[key] = config[key];
};

/**
 * Loading configs from JSON file
 * @public
 * @param {string} filepath Path to JSON configs file
 * @exception {ConfigFileIsNotExists}
 */
Config.prototype.loadFile
= function loadFile(filepath) {
    if (!fs.existsSync(filepath) || fs.statSync(filepath).isDirectory()) {
        throw new exceptions.ConfigFileIsNotExists(null, filepath);
    }

    var data = fs.readFileSync(filepath);

    var json = JSON.parse(data);

    for (var key in json) this.config[key] = json[key];
}

/**
 * Validation config values
 * @public
 * @exception {IncorrectStylesDirPath}
 * @exception {StylesDirIsNotExists}
 */
Config.prototype.validation
= function validation() {
    var val;

    val = this.config['path'];
    if (typeof val !== 'string') {
        throw new exceptions.IncorrectStylesDirPath();
    }
    if (!fs.existsSync(val) || !fs.statSync(val).isDirectory()) {
        throw new exceptions.StylesDirIsNotExists(null, val);
    }
};

// this module is a constructor
module.exports = Config;
