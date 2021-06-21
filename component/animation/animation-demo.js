import { TimeLine, Animation } from "./animation.js";
import { ease } from "./ease.js";

let tl = new TimeLine();
tl.add(
    new Animation({
        object: document.getElementById("box1").style,
        property: "transform",
        startValue: 0,
        endValue: 500,
        duration: 2000,
        timingFunction: ease,
        template: (v) => `translateX(${v}px)`,
    })
);
tl.start();

document.querySelector("#pause-btn").addEventListener("click", () => tl.pause());
document.querySelector("#resume-btn").addEventListener("click", () => tl.resume());
document.querySelector("#reset-btn").addEventListener("click", () => tl.reset());
document.querySelector("#start-btn").addEventListener("click", () => tl.start());
