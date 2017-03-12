#!/usr/bin/env node

var argv = require('yargs')
    .commandDir('cmds')
    .demandCommand()
    .help()
    .alias('h', 'help')
    .usage("$0 <cmd> <cmd-args>")
    .argv;
