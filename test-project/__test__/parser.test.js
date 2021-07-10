import { parseHtml } from "../parser";

describe("Test html parser", () => {
    it("<a></a>", () => {
        let tree = parseHtml("<a></a>");
        expect(tree.children[0].tagName).toBe("a");
    });

    it("<a herf='//u.geektime.org'></a>", () => {
        let tree = parseHtml("<a herf='//u.geektime.org'></a>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<a herf=\"//u.geektime.org\"></a>", () => {
        let tree = parseHtml("<a herf=\"//u.geektime.org\"></a>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<a herf=a></a>", () => {
        let tree = parseHtml("<a herf=a></a>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<a herf=a id></a>", () => {
        let tree = parseHtml("<a herf=a id></a>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    

    it("<a />", () => {
        let tree = parseHtml("<a />");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<a/>", () => {
        let tree = parseHtml("<a/>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<a herf id/>", () => {
        let tree = parseHtml("<a herf id/>");
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<V />", () => {
        let tree = parseHtml("<V />");
        expect(tree.children[0].tagName).toBe("V");
        expect(tree.children[0].children.length).toBe(0);
    });

    it("<>", () => {
        let tree = parseHtml("<>");
        expect(tree.children.length).toBe(1);
        expect(tree.children[0].type).toBe("text");
    });

    it("text", () => {
        let tree = parseHtml("text");
        expect(tree.children[0].type).toBe("text");
    });

    it("<a herf=/>", () => {
        let tree = parseHtml("<a herf=/>");
        console.log(tree);
        expect(tree.children[0].tagName).toBe("a");
        expect(tree.children[0].children.length).toBe(0);
    });
});
