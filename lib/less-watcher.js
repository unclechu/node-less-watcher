#!/usr/bin/env node

var watch = require('watch');
var path = require('path');
var less = require('less');
var fs = require('fs');

var dir = 'styles';
var main = 'main.less';
var outputCSSFile = 'compiled_styles.css';
var pathToDir = dir;
var pathToMain = path.join(pathToDir, main);
var pathToOutputFile = path.join(pathToDir, outputCSSFile);

var compress = true;

var compileCounter = 0;

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

function compile() {
    var data;
    try {
        data = fs.readFileSync(pathToMain);
    } catch (err) {
        console.error('Read file error "%s" [%s]', pathToMain);
    }
    var parser = new(less.Parser)({ paths: [pathToDir] });
    parser.parse(data.toString(), function (err, tree) {
        if (err) {
            console.error('Compile .less file error: "%s" [%s]', err.toString(), time());
            return;
        }

        var outputCSS;
        try {
            outputCSS = tree.toCSS({ compress: compress });
        } catch (err) {
            console.error('Compile .less file error: "%s" [%s]', err.toString(), time());
            return;
        }

        try {
            fs.writeFileSync(pathToOutputFile, outputCSS);
        } catch (err) {
            console.error('Write to file error "%s" [%s]', pathToOutputFile, time());
            return;
        }

        console.log(
            'Compiled CSS (counter: %d) written to file "%s" [%s]',
            ++compileCounter,
            pathToOutputFile,
            time()
        );
    });
}

function recompileCallback(filename) {
    if (path.extname(filename) === '.less') {
        console.log('Catched! "%s" [%s]', filename, time());
        compile();
    }
}

compile(); // compile at start

watch.createMonitor(pathToDir, function (monitor) {
    monitor.on('created', recompileCallback);
    monitor.on('changed', recompileCallback);
    monitor.on('removed', recompileCallback);
    console.log('Started watcher for .less files in directory "%s" [%s]', pathToDir, time());
});
