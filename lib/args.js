/**
 * @overview Arguments parser
 * @module args
 *
 * @author Viacheslav Lotsmanov
 * @license GPLv3
 */

var path = require('path');
var fs = require('fs');

// inner modules
var exceptions = require('./exceptions');

var usageInfo = '\n\
USAGE\n\
=====\n\
\n\
--config=<path>\n\
    Path to JSON config file.\n\
    Example by default value: --config=less-watcher.config.json\n\
\n\
--path=<path>\n\
    Path to directory of .less styles files.\n\
    Example by default value: --path=./styles/\n\
\n\
--to-compile=<compile list>\n\
    List of files to compile\n\
    Example by default value: --to-compile=main.less:compiled_styles.css\n\
    Example: --to-compile=main.less:main.css,header.less:header.css\n\
\n\
--compress[=<yes|no>]\n\
    Minify output compiled .css file(s).\n\
    Default value: yes\n\
\n\
--debug[=<yes|no>]\n\
    Show messages about detecting changes of any .less files and about\n\
    compiling.\n\
    Default value: yes\n\
\n\
--events=<events list>\n\
    List of events for "watch" module.\n\
    Example by default value: --events=created,changed,removed\n\
\n\
--extensions=<extensions list>\n\
    File extensions to watch\n\
    Example by default value: --extensions=.less\n\
    Example: --extensions=.less,.lesscss\n\
\n\
--just-compile\n\
    Do not watching, just compile styles.\n\
';

/**
 * @constructor
 * @public
 * @exception {ConfigFileIsNotExists}
 */
function Args() {
    /** @private */ var self = this;

    /**
     * @public
     * @readOnly
     * @instance
     * @type {config}
     */
    this.config = {};

    /**
     * @public
     * @readOnly
     * @instance
     * @type {Object.<*>}
     */
    this.args = {
        'config': undefined,
        'just_compile': false
    };

    process.argv.slice(2).forEach(function (arg) {
        var val;

        if (/^--config=/.test(arg)) {
            val = arg.substr('--config='.length);
            if (val === '') emptyArgValue('config');
            val = path.join(process.cwd(), val);
            if (!fs.existsSync(val) || fs.statSync(val).isDirectory()) {
                throw new exceptions.ConfigFileIsNotExists(null, val);
            }
            self.args['config'] = val;

        } else if (/^--path=/.test(arg)) {
            val = arg.substr('--path='.length);
            if (val === '') emptyArgValue('path');
            self.config['path'] = val;

        } else if (/^--to-compile=/.test(arg)) {
            val = arg.substr('--to-compile='.length);
            if (val === '') emptyArgValue('to-compile');
            val = val.split(',');
            var list = [];
            val.forEach(function (item) {
                var split = item.split(':');
                if (split.length !== 2) incorrectArgValue('to-compile');
                list.push({
                    input_less: split[0],
                    output_css: split[1]
                });
            });
            console.log(list);
            self.config['to_compile'] = list;

        } else if (/^--compress$/.test(arg)) {
            self.config['compress'] = true;
        } else if (/^--compress=/.test(arg)) {
            val = arg.substr('--compress='.length);
            if (val === '') emptyArgValue('compress');
            val = val.toLowerCase();
            if (val === 'y' || val === 'yes' || val === '1' || val === 'true') {
                self.config['compress'] = true;
            } else if (val === 'n' || val === 'no' || val === '0' || val === 'false') {
                self.config['compress'] = false;
            } else incorrectArgValue('compress');

        } else if (/^--debug$/.test(arg)) {
            self.config['debug'] = true;
        } else if (/^--debug/.test(arg)) {
            val = arg.substr('--debug='.length);
            if (val === '') emptyArgValue('debug');
            val = val.toLowerCase();
            if (val === 'y' || val === 'yes' || val === '1' || val === 'true') {
                self.config['debug'] = true;
            } else if (val === 'n' || val === 'no' || val === '0' || val === 'false') {
                self.config['debug'] = false;
            } else incorrectArgValue('debug');

        } else if (/^--events=/.test(arg)) {
            val = arg.substr('--events='.length);
            if (val === '') emptyArgValue('events');
            val = val.split(',');
            self.config['events'] = val;

        } else if (/^--extensions=/.test(arg)) {
            val = arg.substr('--extensions='.length);
            if (val === '') emptyArgValue('extensions');
            val = val.split(',');
            self.config['extensions'] = val;

        } else if (/^--just-compile$/.test(arg)) {
            self.args['just_compile'] = true;

        // help info
        } else if (/^--help$/.test(arg) || /^-h$/.test(arg)) {
            console.log(usageInfo);
            process.exit(0);
        } else {
            console.error('Unknown argument "'+ arg +'".');
            console.log(usageInfo);
            process.exit(1);
        }
    });
}

/**
 * Error reporting helper
 * @private
 * @inner
 * @memberOf Args
 */
function emptyArgValue(argName) {
    console.error('Empty "--'+ argName +'=" argument value.');
    console.log(usageInfo);
    process.exit(1);
}

/**
 * Error reporting helper
 * @private
 * @inner
 * @memberOf Args
 */
function incorrectArgValue(argName) {
    console.error('Incorrect "--'+ argName +'=" argument value.');
    console.log(usageInfo);
    process.exit(1);
}

// this module is a constructor
module.exports = Args;
