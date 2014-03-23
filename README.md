less-watcher
============

Automatically detecting changes in [.less](http://lesscss.org/) files and recompile styles.

Install
=======

Global
------

    # npm install -g less-watcher

Local
-----

    $ npm install less-watcher
    $ ln -s node_modules/.bin/less-watcher

Usage
=====

Show usage info
---------------

    $ less-watcher --help

Use config file
---------------

Copy [/examples/less-watcher.config.json](./examples/less-watcher.config.json) to work dir and modify it.

Documentation
=============

See [/docs](./docs/) for automatically generated documentation by [JSDoc](http://usejsdoc.org/) utility.

Generation
----------

    $ jsdoc bin/* lib/* -p -d docs
