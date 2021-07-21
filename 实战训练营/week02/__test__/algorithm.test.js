import { reverseChainTable, findKthLargest, quickSort, lengthOfLongestSubstring, caculateExpress } from "../algorithm.js";
import { ChainTable } from "../chain-table.js";
describe("reverseChainTable", () => {
    test("[1, 3, 4, 5, 6]", () => {
        let chainTable = new ChainTable();
        [1, 3, 4, 5, 6].forEach((element) => {
            chainTable.append(element);
        });

        chainTable.head = reverseChainTable(chainTable.head);
        
        expect(chainTable.display()).toBe("6->5->4->3->1->head");
    });

    test("[9, 3, 2, 5, 6]", () => {
        let chainTable = new ChainTable();
        [9, 3, 2, 5, 6].forEach((element) => {
            chainTable.append(element);
        });

        chainTable.head = reverseChainTable(chainTable.head);
        expect(chainTable.display()).toBe("6->5->2->3->9->head");
    });
});


describe("findKthLargest", () => {
    test("[2, 1, 8, 5, 7, 10, 33, 6], k = 5", () => {
        let list = [2, 1, 8, 5, 7, 10, 33, 6];
        expect(findKthLargest(list, 5)).toBe(6);
    });

    test("[9], k = 1", () => {
        let list = [9];
        expect(findKthLargest(list, 1)).toBe(9);
    });
    test("[2, 1, 8, 5, 7, 10, 33, 6], k = 0", () => {
        let list = [2, 1, 8, 5, 7, 10, 33, 6];
        expect(findKthLargest(list, 0)).toBe(null);
    });

    test("[1, 2, 3, 8, 9], k = 2", () => {
        let list = [1, 2, 3, 8, 9];
        expect(findKthLargest(list, 2)).toBe(8);
    });
});

describe("caculateExpress", () => {
    test("5+(4/(9+1)) = 5.4", () => {
        expect(caculateExpress("5+(4/(9+1))")).toBe(5.4);
    });

    test("(5+(4/(9+1)))*10 = 54", () => {
        expect(caculateExpress("(5+(4/(9+1)))*10")).toBe(54);
    });
});

