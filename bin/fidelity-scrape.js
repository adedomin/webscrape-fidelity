#!/usr/bin/env node
/*
 * Copyright (c) 2017, Anthony DeDominic <adedomin@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var fs = require('fs'),
    path = require('path'),
    yargs = require('yargs')
        .usage('usage: $0 -C cred.json [-d delta] [-n] [-w warn] [-c crit]')
        .options({
            nagios: {
                alias: 'n',
                describe: 'nagios perfdata output',
                boolean: true,
            },
            delta: {
                alias: 'd',
                describe: 'file to store weighted moving average.',
            },
            warn: {
                alias: 'w',
                describe: 'warn on change (either dollar value or %)',
            },
            crit: {
                alias: 'c',
                describe: 'warn on change (either dollar value or %)',
            },
            credentials: { 
                alias: 'C',
                describe: 'json file with: { "username": "user", "password": "pass" }',
            },
            user: {
                alias: 'u',
                describe: 'INSECURE: username',
            },
            pass: {
                alias: 'P',
                describe: 'INSECURE: password',
            },
            pretty: {
                alias: 'p',
                describe: 'human readable json',
                boolean: true,
            },
        })
        .implies('w', 'd')
        .implies('c', 'd')
        .implies('u', 'P')
        .implies('P', 'u')
        .nargs('C', 1)
        .help('h')
        .alias('h', 'help'),
    argv = yargs.argv

if (!argv.user && !argv.credentials) {
    console.error('Credentials required\n')
    yargs.showHelp()
    process.exit(1)
}

var creds, 
    data = '', 
    readFromFile = false

if (argv.user) {
    creds = { username: argv.user, password: argv.pass }
}
else if (argv.credentials == '-') {
    var buf = Buffer.alloc(512)
    var bytesRead = 1
    while (bytesRead) {
        try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, buf.length)
        }
        catch (e) {
            if (e.code == 'EAGAIN') { 
                console.error('use a herestring, heredoc, pipe or redirect\n')
                process.exit(1)
            }
            else if (e.code != 'EOF') { 
                throw e
            }
        }
        data += buf.toString()
    }
    readFromFile = true
}
else {
    data = fs.readFileSync(argv.credentials).toString()
    readFromFile = true
}

if (readFromFile) {
    try {
        creds = JSON.parse(data.split('\0')[0])
        if (!creds.username || !creds.password)
            throw 'err'
    }
    catch (e) {
        console.error('Invalid Credentials file')
        throw e
    }
}

var nagios
if (argv.nagios) {
    nagios = {
        warn: argv.warn || 0,
        crit: argv.crit || 0,
        delta: argv.delta || '',
    }
    if (argv.warn) {
        if (argv.warn.charAt(0) == '$')
            argv.warn = argv.warn.split(1)
        nagios.warn = +(argv.warn.split(/,/g, ''))
    }
    if (argv.crit) {
        if (argv.crit.charAt(0) == '$')
            argv.crit = argv.crit.split(1)
        nagios.crit = +(argv.crit.split(/,/g, ''))
    }

    if (isNaN(nagios.warn) || isNaN(nagios.crit)) {
        console.error('warning value is not numeric.')
        process.exit(1)
    }
}

if (argv.pretty) argv.pretty = 2
else argv.pretty = null

require(path.join(__dirname, '../index.js'))(creds, nagios, argv.pretty)
