import { ChainTable, ListNode } from "./chain-table.js";
/**
 * 链表反转
 * @param {ListNode} head
 */
export function reverseChainTable(head) {
    if (!head.next) {
        return;
    }
    let current = head;
    let prev = null;

    while (current) {
        let next = current.next;

        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}
/**
 * 数组中第K大元素
 * @param {Array} list
 * @param {number} k
 */
export function findKthLargest(list, k) {
    if (!list.length) {
        return null;
    }
    if (k > list.length || k <= 0) {
        return null;
    }
    if (k === 1 && list.length === 1) {
        return list[0];
    }

    let partition = function (list, left, right) {
        randomPartition(list, left, right);
        let pivot = right;
        let i = left;
        let j = left;

        while (j < right) {
            if (list[pivot] < list[j]) {
                exchange(list, i, j);
                i++;
            }
            j++;
        }
        exchange(list, pivot, i);

        return i;
    };

    let quickSelect = function (list, left, right, k) {
        let pivotIndex = partition(list, left, right);
        // pivot 是我们要找的 Top k
        if (k == pivotIndex - left + 1) return list[pivotIndex];
        // Top k 在左边
        if (k < pivotIndex - left + 1) return quickSelect(list, left, pivotIndex - 1, k);
        // Top k 在右边
        return quickSelect(list, pivotIndex + 1, right, k - (pivotIndex - left + 1));
    };
    let left = 0;
    let right = list.length - 1;
    return quickSelect(list, left, right, k);
}

// 确保标杆点随机
let randomPartition = function (list, left, right) {
    let pivotIndex = Math.floor(Math.random() * (right - left + 1) + left);
    exchange(list, pivotIndex, right);
};
// 交换
let exchange = function (list, index1, index2) {
    [list[index1], list[index2]] = [list[index2], list[index1]];
};
/**
 * 快速排序
 * @param {Array} list
 */
export let quickSort = function (list) {
    if (list.length <= 1) {
        return list;
    }
    randomPartition(list, 0, list.length - 1);
    let pivot = list.splice(list.length - 1, 1)[0];

    let left = [];
    let right = [];
    list.forEach((item) => {
        if (item < pivot) {
            left.push(item);
        } else {
            right.push(item);
        }
    });
    return quickSort(left).concat([pivot], quickSort(right));
};

/**
 * 不重复最长子串
 */
export function lengthOfLongestSubstring() {}

/**
 * 四则运算
 * 5+(4/(9+1))
 * @param {string} expressString
 */
export function caculateExpress(expressString) {
    let list = [expressString];
    let result = expressString;
    // 拆分括号项
    while (result) {
        result = result.match(/\((.*)\)/);
        if (result && result.length > 1) {
            list.push(result[1]);
            result = result[1];
        }
    }
    list = list.reverse()
    
    let currentValue = "";
    let lastItem = "";
    for (let express of list) {
        let tReg = new RegExp(`\\(${lastItem}\\)`);
        let newExpress = express.replace(tReg, currentValue);
        let regExp = /([0-9\.]+)([\+|\-|\*|\/]?)([0-9\.]+)/;
        regExp.exec(newExpress);
        switch (RegExp.$2) {
            case "+":
                currentValue = Number(RegExp.$1) + Number(RegExp.$3);
                break;
            case "/":
                currentValue = Number(RegExp.$1) / Number(RegExp.$3);
                break;
            case "*":
                currentValue = Number(RegExp.$1) * Number(RegExp.$3);
                break;
            case "-":
                currentValue = Number(RegExp.$1) - Number(RegExp.$3);
                break;
            default:
                break;
        }
        express = express.replace(/\+/g, "\\+");
        express = express.replace(/\-/g, "\\-");
        express = express.replace(/\*/g, "\\*");
        express = express.replace(/\//g, "\\/");
        express = express.replace(/\(/g, "\\(");
        express = express.replace(/\)/g, "\\)");
        lastItem = express;
    }

    return currentValue;
}

/*
// 01
let chainTable = new ChainTable();
[1, 3, 4, 5, 6].forEach((element) => {
    chainTable.append(element);
});

chainTable.display();
console.time("链表反转");
chainTable.head = reverseChainTable(chainTable.head);
console.timeEnd("链表反转");
chainTable.display();

// 02
let list2 = [2, 1, 8, 5, 7, 10, 33, 6];
console.time("找最大K");
console.log(findKthLargest(list2, 2));
console.timeEnd("找最大K");

// 03
let list3 = [2, 1, 8, 5, 7, 10, 33, 6];
console.time("快速排序");
console.log(quickSort(list3));
console.timeEnd("快速排序");
*/
