/**
 * kmp算法
 * @param {String} source
 * @param {String} pattern
 */
function kmp(source, pattern) {
    let table = new Array(pattern.length).fill(0);
    {
        let i = 1,
            j = 0;
        while (i < pattern.length) {
            if (pattern[i] === pattern[j]) {
                ++j, ++i;
                table[i] = j;
            } else {
                if (j > 0) {
                    j = table[j];
                } else {
                    ++i;
                }
            }
        }

        console.log(table);
    }
    {
        let i = 0,
            j = 0;
        while (i < source.length) {
            if (pattern[j] === source[i]) {
                ++i, ++j;
            } else {
                if (j > 0) {
                    j = table[j];
                } else {
                    ++i;
                }
            }
            if (j === pattern.length) {
                return true;
            }
        }
        return false;
    }
}
/**
 * 《部分匹配表》（Partial Match Table）
 * @param {String} pattern
 */
function pmt(pattern) {
    let table = new Array(pattern.length).fill(0);

    return table;
}

class PartialMatchTable {
    constructor(pattern) {
        this.pattern = pattern;
        this.table = new Array(pattern.length).fill(0);
        this.currentStatus = this.mainCirculation;
    }
    get pmt() {
        let i = 1;
        let j = 0;
        while (i < this.pattern.length) {
            this.currentStatus = this.currentStatus(i, j);
        }
    }
    mainCirculation(i, j) {
        if (this.pattern[i] === this.pattern[j]) {
            this.currentStatus = this.isEqual;
        } else {
            if (j > 0) {
                this.currentStatus = this.jNotZero;
            } else {
                ++i;
            }
        }
    }
    isEqual(i, j) {
        ++i, ++j;
        this.table[i] = j;
        this.currentStatus = this.mainCirculation;
    }
    jNotZero(i, j) {
        j = this.table[j];
        this.currentStatus = this.isEqual;
    }
}

console.log(kmp("", "abababc"));
