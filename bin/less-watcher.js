#!/usr/bin/env node
/**
 * @overview Automatically detecting changes in .less files and recompile styles.
 * @module less-watcher
 *
 * @requires watch
 * @requires less
 *
 * @see {@link https://github.com/unclechu/node-less-watcher|GitHub}
 * @author Viacheslav Lotsmanov
 * @license GPLv3
 */

var watch = require('watch');
var less = require('less');
var colors = require('colors');

var path = require('path');
var fs = require('fs');

colors.setTheme({
    info: 'green',
    help: 'cyan',
    data: 'italic',
    catched: 'blue',
    warn: 'yellow',
    error: 'red'
});

// inner modules
var Config = require('../lib/config');
var Args = require('../lib/args');

var args = new Args();

var defaultConfigFilePath = 'less-watcher.config.json';

/**
 * @typedef {JSON} to_compile
 * @prop {string} input_less Path to input .less file
 * @prop {string} output_css Path to output compiled .css file
 */
/**
 * @typedef {JSON} config
 * @prop {string} [path=./styles/] Path to .less files directory
 * @prop {Array.<to_compile>} [to_compile={ "input_less": "main.less", "output_css": "compiled_styles.css" }]
 * @prop {boolean} [compress=true] Minify output compiled .css file(s)
 * @prop {boolean} [debug=true] Show messages about detecting changes of any .less files and about compiling
 * @prop {Array.<string>} [events="created", "changed", "removed"] Events for "watch" module
 * @prop {Array.<string>} [extensions=".less"] File extensions to watch
 */
var defaultConfig = require('../examples/less-watcher.config.json');

/**
 * @private
 * @returns {string} Current time stamp by format: "[%H:%i:%s]"
 */
function time() {
    var date = new Date();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (seconds.length < 2) seconds = '0' + seconds;
    return hours +':'+ minutes +':'+ seconds;
}

var config = new Config(defaultConfig);

if (!args.args['config'] && (!fs.existsSync(defaultConfigFilePath)
|| fs.statSync(defaultConfigFilePath).isDirectory())) {
    console.warn(
        ('Configurations JSON file path is not set by argument'
        +' and file by default value ("'+ defaultConfigFilePath +'") is not exists.'

        +'\nWill be used default configs:\n').warn
        +('  '+JSON.stringify(defaultConfig, null, 2).replace(/\n/g, '\n  ')).warn
    );
} else if (args.args['config']) {
    config.loadFile(args.args['config']);
} else {
    if (fs.existsSync(defaultConfigFilePath)
    && !fs.statSync(defaultConfigFilePath).isDirectory()) {
        config.loadFile(defaultConfigFilePath);
    }
}

// extend config by arguments
var argsConfigs = {};
for (var key in args.config) argsConfigs[key] = args.config[key];
config.set(argsConfigs);

config.validation();

var stylesDir = path.join(process.cwd(), config.config['path']);

/**
 * If output CSS directories don't exist create them
 * (including their parents).
 * @private
 */
function createNotExistingOutputDirectories() {
    config.config['to_compile'].forEach(function (val) {
        var dir = path.dirname(path.join(stylesDir, val['output_css']));
        var toCreate = [];
        var stat;

        while (dir !== null) {
            try {
                stat = fs.lstatSync(dir);
            } catch (e) {
                if (e.code !== 'ENOENT') throw e;
                toCreate.unshift(dir);
                dir = path.dirname(dir);
                continue;
            }

            if (stat.isDirectory()) {
                break;
            } else {
                console.error(
                    ('Output path "%s" exists but it is not a directory! '
                    +'Rename or remove it first.').error, dir
                );
                process.exit(1);
            }
        }

        toCreate.forEach(function (x) {
            config.config['debug'] && console.log(
                'Creating output CSS directory "%s"... [%s]'.data, x, time()
            );
            fs.mkdirSync(x);
        });
    });
}

var compileCounter = 0;

/**
 * Compile .less file and save to .css file logic
 * @private
 */
function compile() {
    compileCounter++;
    config.config['to_compile'].forEach(function (val) {
        var data;
        var pathToLess = path.join(stylesDir, val['input_less']);
        var pathToCSS = path.join(stylesDir, val['output_css']);

        config.config['debug'] && console.log(
            'Compiling less "%s" to css "%s" (counter: %d) [%s]'.data,
            val['input_less'], val['output_css'], compileCounter, time()
        );

        try {
            data = fs.readFileSync(pathToLess);
        } catch (err) {
            config.config['debug'] && console.error(
                'Read file error ("%s") error: "%s" [%s]'.error,
                pathToLess, err.toString(), time()
            );
            return;
        }

        less.render(data.toString(), {
            paths: [path.dirname(pathToLess)],
            compress: config.config['compress']
        }, function (err, result) {
            if (err) {
                config.config['debug'] && console.error(
                    'Compile .less file ("%s") error: "%s" [%s]'.error,
                    pathToLess, err.toString(), time()
                );
                return;
            }

            var css;
            // less v1.x
            if (typeof result === 'string')
                css = result;
            // less v2.x and v3.x
            else if (typeof result === 'object' && typeof result.css === 'string')
                css = result.css;
            else {
                config.config['debug'] && console.error(
                    'Compile .less file ("%s") error: "%s" [%s]'.error,
                    pathToLess,
                    new Error('Unexpected less.js "render" result type'),
                    time()
                );
                return;
            }

            try {
                fs.writeFileSync(pathToCSS, css);
            } catch (err) {
                config.config['debug'] && console.error(
                    'Write to file ("%s") error: "%s" [%s]'.error,
                    pathToCSS, err.toString(), time()
                );
                return;
            }

            config.config['debug'] && console.log(
                'Compiled less "%s" to css "%s" (counter: %d) [%s]'.info,
                pathToLess, pathToCSS, compileCounter, time()
            );
        });
    });
}

/**
 * Function will called for each event that in config key "events"
 * @private
 */
function recompileCallback(filename) {
    config.config['extensions'].every(function (ext) {
        if (path.extname(filename) === ext) {
            config.config['debug'] && console.log(
                'Catched! "%s" [%s]'.catched, filename, time()
            );
            compile();
            return false;
        }
        return true;
    });
}

createNotExistingOutputDirectories();
compile(); // compile at start

(!args.args['just_compile'])
&& watch.createMonitor(stylesDir, function (monitor) {
    config.config['events'].forEach(function (event) {
        monitor.on(event, recompileCallback);
    });
    console.log(
        'Started watcher for less files ("%s") in directory "%s" [%s]'.data,
        config.config['extensions'].join('", "'), stylesDir, time()
    );
});
