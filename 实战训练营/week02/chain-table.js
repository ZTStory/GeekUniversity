// [1, 3, 5, 6, 8]
export class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}
export class ChainTable {
    constructor() {
        this.length = 0;
        this.head = new ListNode("head");
        this.currentNode = null;
    }
    findLast() {
        let currNode = this.head;
        while (currNode.next) {
            currNode = currNode.next;
        }
        return currNode;
    }
    append(item) {
        let currNode = this.findLast();
        let newNode = new ListNode(item);
        currNode.next = newNode;
        this.length++;
    }
    clear() {
        this.head.next = null;
        this.length = 0;
    }
    display() {
        let result = "";
        let currNode = this.head;
        while (currNode) {
            result += currNode.val;
            currNode = currNode.next;
            if (currNode) result += "->";
        }
        console.log(result);
        return result;
    }
}
