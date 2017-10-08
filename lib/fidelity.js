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
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var puppeteer = require('puppeteer')

module.exports = async function run(username, password) {
    var balance
    try { 
        var browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
        var page = await browser.newPage()
        page.on('error', (err) => console.error(err))
        page.on('console', (log) => console.error(log))
        await page.goto('https://401k.com')
        await page.waitForSelector('#ssnt')

        await page.focus('#ssnt')
        await page.type(username)
        await page.focus('#pin')
        await page.type(password)
        await page.evaluate(() => {
            document.getElementById('login-submit').click()
        })
        await page.waitForSelector('#portfolioBalAndShares')

        balance = await page.evaluate(() => {
            var balanceEl = document
                .getElementById('portfolioBalAndShares')
                .innerHTML
            return +balanceEl.slice(
                balanceEl.indexOf('$')+1, balanceEl.indexOf('*')
            ).replace(/,/g, '')
        })

        if (isNaN(balance)) {
            throw 'error, invalid credentials'
        }
    }
    catch (e) {
        console.error(e)
        balance = 'ERROR: login error'
    }
    browser.close()
    return balance
}
