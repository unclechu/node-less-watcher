less-watcher
============

Automatically detecting changes in [.less](http://lesscss.org/) files and recompiling styles.

[![NPM](https://nodei.co/npm/less-watcher2.png)](https://nodei.co/npm/less-watcher2/)

About less.js dependency
------------------------

Supported versions are: `1.2.0` and higher (`3.7.1` was last tested).

Install
=======

Global
------

    # npm install -g less-watcher2

Local
-----

    $ npm install less-watcher2
    $ ln -s ./node_modules/.bin/less-watcher

Usage
=====

Show usage info
---------------

Global install: `$ less-watcher --help`

Local install: `$ ./less-watcher --help`

Use config file
---------------

Copy [examples/less-watcher.config.json](examples/less-watcher.config.json)
to your working directory and modify it.

Compile and exit (without watching)
-----------------------------------

Global install: `$ less-watcher --just-compile`

Local install: `$ ./less-watcher --just-compile`

Output
------

    $ less-watcher
    Configurations JSON file path is not set by argument and file by default value ("less-watcher.config.json") is not exists.
    Will be used default configs:
      {
        "path": "./styles/",
        "to_compile": [
          {
            "input_less": "main.less",
            "output_css": "compiled_styles.css"
          }
        ],
        "compress": true,
        "debug": true,
        "events": [
          "created",
          "changed",
          "removed"
        ],
        "extensions": [
          ".less"
        ]
      }
    Compiling less "main.less" to css "compiled_styles.css" (counter: 1) [20:13:01]
    Started watcher for less files (".less") in directory ".../styles/" [20:13:01]
    Compiled less "main.less" to css "compiled_styles.css" (counter: 1) [20:13:02]
    Catched! ".../styles/goods.less" [20:13:11]
    Compiling less "main.less" to css "compiled_styles.css" (counter: 2) [20:13:11]
    Compiled less "main.less" to css "compiled_styles.css" (counter: 2) [20:13:12]

Documentation
=============

See [docs](docs/) for automatically generated documentation by [JSDoc](http://usejsdoc.org/) utility.

Generation
----------

    $ jsdoc bin/* lib/* -p -d docs

License
=======

[GPLv3](LICENSE)
