import { Component } from "./framework";

export class Carousel extends Component {
    constructor() {
        super();
        this.attributes = Object.create(null);
    }
    setAttribute(attrName, value) {
        this.attributes[attrName] = value;
    }
    render() {
        this.root = document.createElement("div");
        this.root.classList.add("carousel");
        for (const iterator of this.attributes.src) {
            let child = document.createElement("div");
            child.style.backgroundImage = `url(${iterator})`;
            this.root.appendChild(child);
        }

        // 自动轮播  始终视图可见范围只有2张图，所以只需要处理当前与下一张
        /*
        let currentIndex = 0;
        setInterval(() => {
            let children = this.root.children;
            let nextIndex = (currentIndex + 1) % children.length;
            let current = children[currentIndex];
            let next = children[nextIndex];

            next.style.transition = "none";
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

            // 16ms 为浏览器的1帧动画事件，防止设置位置更换失效
            setTimeout(() => {
                next.style.transition = "";
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
                next.style.transform = `translateX(${- nextIndex * 100}%)`

                currentIndex = nextIndex;
            }, 16);
            
        }, 3000); 
        */

        // 手动轮播
        let position = 0;
        this.root.addEventListener("mousedown", (event) => {
            let children = this.root.children;
            // 此处使用clientX 是因为相对稳定，不会随着标签移动而变化
            let startX = event.clientX;
            let move = (moveEvent) => {
                let offsetX = moveEvent.clientX - startX;
                let current = position - (offsetX - (offsetX % 500)) / 500;
                for (const offset of [-1, 0, 1]) {
                    let pos = current + offset;
                    // 确保是正数
                    pos = (pos + children.length) % children.length;
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (offsetX % 500)}px)`;
                }
            };
            let up = (upEvent) => {
                let offsetX = upEvent.clientX - startX;
                // console.log(offsetX);
                position = position - Math.round(offsetX / 500);
                // console.log(-Math.sign(Math.round(offsetX / 500) - offsetX + 250 * Math.sign(offsetX)));
                for (const offset of [0, -Math.sign(Math.round(offsetX / 500) - offsetX + 250 * Math.sign(offsetX))]) {
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length;
                    children[pos].style.transition = "";
                    children[pos].style.transform = `translateX(${-pos * 500 + offset * 500}px)`;
                }
                // document上添加事件即便是出了浏览器范围 也依然可监听到，防止事件监听遗漏
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            };
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        });
        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}
