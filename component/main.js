import { Button } from "./Button.js";
import { Carousel } from "./carousel.js";
import { createElement } from "./framework.js";
import { List, ListItem } from "./List.js";

let d = [
    {
        img: "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
        url: "https://www.baidu.com",
        title: "蓝猫",
    },
    {
        img: "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
        url: "https://buswap.bababus.com",
        title: "橘猫",
    },
    {
        img: "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
        url: "https://time.geekbang.org",
        title: "橘猫加白",
    },
    {
        img: "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
        url: "https://u.geekbang.org",
        title: "不知道",
    },
];

let a = <Carousel src={d} onChange={(e) => console.log(e.detail.position)} onClick={(e) => (window.location.href = e.detail.url)} />;

let b = <Button onClick={(e) => console.log("点击了按钮")}>按钮</Button>;
let c = <List data={d}>{(record) => <ListItem data={record} onClick={(e) => console.log(e.detail.item.url)}></ListItem>}</List>;

a.mountTo(document.body);
b.mountTo(document.body);
c.mountTo(document.body);
