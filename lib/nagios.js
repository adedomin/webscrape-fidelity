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

var NagiosExits = {
    OK: 0,
    WARN: 1,
    CRIT: 2,
    UNKN: 3,
}

module.exports = function(balance) {
    var status, msg
    if (isNaN(balance)) {
        status = NagiosExits.CRIT
        msg = 'Critical -'
    }
    else {
        status = NagiosExits.OK
        msg = 'OK -'
    }

    return { 
        status,
        msg: `${msg} Fidelity 401k Total Balance | total=${balance}`,
    }
}
