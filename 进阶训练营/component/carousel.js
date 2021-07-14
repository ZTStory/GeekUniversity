import { Component, STATE, ATTRIBUTE } from "./framework";
import { Animation, TimeLine } from "./animation/animation";
import { ease } from "./animation/ease";
import { enableGesture, PanGesture, TapGesture } from "./gesture/gesture";

export class Carousel extends Component {
    constructor() {
        super();
    }

    render() {
        this.root = document.createElement("div");
        this.root.classList.add("carousel");
        for (const iterator of this[ATTRIBUTE].src) {
            let child = document.createElement("div");
            child.style.backgroundImage = `url(${iterator.img})`;
            this.root.appendChild(child);
        }

        enableGesture(this.root);
        this[STATE].position = 0;

        let t = Date.now();
        let ax = 0;

        let tl = new TimeLine();
        tl.start();

        let handler = null;

        let nextPic = () => {
            let children = this.root.children;
            let nextIndex = (this[STATE].position + 1) % children.length;
            let current = children[this[STATE].position];
            let next = children[nextIndex];

            t = Date.now();

            tl.add(
                new Animation({
                    object: current.style,
                    property: "transform",
                    startValue: -this[STATE].position * 500,
                    endValue: -500 - this[STATE].position * 500,
                    duration: 500,
                    timingFunction: ease,
                    template: (v) => `translateX(${v}px)`,
                })
            );
            tl.add(
                new Animation({
                    object: next.style,
                    property: "transform",
                    startValue: 500 - nextIndex * 500,
                    endValue: -nextIndex * 500,
                    duration: 500,
                    timingFunction: ease,
                    template: (v) => `translateX(${v}px)`,
                })
            );

            this[STATE].position = nextIndex;
            this.triggerEvent("change", { position: this[STATE].position });
        };
        handler = setInterval(nextPic, 3000);

        // 手动轮播
        new PanGesture(this.root, (event) => {
            let children = this.root.children;
            if (event.type === "start") {
                tl.pause();
                if (Date.now() - t < 500) {
                    let progress = (Date.now() - t) / 500;
                    ax = ease(progress) * 500 - 500;
                    console.log(progress, ax);
                } else {
                    ax = 0;
                }
                clearInterval(handler);
            } else if (event.type === "move") {
                let offsetX = event.clientX - event.startX - ax;
                let current = this[STATE].position - (offsetX - (offsetX % 500)) / 500;

                for (const offset of [-1, 0, 1]) {
                    let pos = current + offset;
                    // 确保是正数
                    pos = ((pos % children.length) + children.length) % children.length;
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (offsetX % 500)}px)`;
                }
            } else if (event.type === "end") {
                tl.reset();
                tl.start();
                handler = setInterval(nextPic, 3000);

                let offsetX = event.clientX - event.startX - ax;
                let current = this[STATE].position - (offsetX - (offsetX % 500)) / 500;
                let direction = Math.round((offsetX % 500) / 500);

                for (const offset of [-1, 0, 1]) {
                    let pos = current + offset;
                    // 确保是正数
                    pos = ((pos % children.length) + children.length) % children.length;
                    children[pos].style.transition = "none";

                    tl.add(
                        new Animation({
                            object: children[pos].style,
                            property: "transform",
                            startValue: -pos * 500 + offset * 500 + (offsetX % 500),
                            endValue: -pos * 500 + offset * 500 + direction * 500,
                            duration: 500,
                            timingFunction: ease,
                            template: (v) => `translateX(${v}px)`,
                        })
                    );
                }

                this[STATE].position = this[STATE].position - (offsetX - (offsetX % 500)) - direction;
                this[STATE].position = ((this[STATE].position % children.length) + children.length) % children.length;

                this.triggerEvent("change", { position: this[STATE].position });
            }
        });

        new TapGesture(this.root, (event) => {
            console.log(`当前点击了第${this[STATE].position + 1}张`);
            this.triggerEvent("click", { position: this[STATE].position, url: this[ATTRIBUTE].src[this[STATE].position].url });
        });

        return this.root;
    }
}
