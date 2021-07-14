import { linear } from "./ease.js";

const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start_time");
const PAUSE_START = Symbol("pause_start");
const PAUSE_TIME = Symbol("pause_time");

export class TimeLine {
    constructor() {
        this.state = "Inited";
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
    }

    start() {
        if (this.state !== "Inited") {
            return;
        }
        this.state = "started";
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            for (const animation of this[ANIMATIONS]) {
                // console.log(animation);
                let t;
                if (this[START_TIME].get(animation) < startTime) {
                    t = Date.now() - startTime - animation.pauseTime - animation.delay;
                } else {
                    t = Date.now() - this[START_TIME].get(animation) - animation.pauseTime - animation.delay;
                }
                if (animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }
                if (t > 0) {
                    animation.receiveTime(t);
                }
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        };
        this[TICK]();
    }

    pause() {
        if (this.state !== "started") {
            return;
        }
        this.state = "paused";
        for (const animation of this[ANIMATIONS]) {
            animation.pause();
        }
        this[PAUSE_START] = Date.now();
        if (this[TICK_HANDLER]) {
            cancelAnimationFrame(this[TICK_HANDLER]);
        }
    }
    /// 重复暂停的PAUSE_TIME会导致新加入的动画拥有蜜汁延迟，解决方案为Animation对象自行管理暂停时间，由timeLine统一触发暂停和恢复
    resume() {
        if (this.state !== "paused") {
            return;
        }
        for (const animation of this[ANIMATIONS]) {
            animation.resume();
        }
        this.state = "started";
        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]();
    }

    reset() {
        this.pause();
        this.state = "Inited";
        for (const animation of this[ANIMATIONS]) {
            animation.reset();
        }
        this[PAUSE_TIME] = 0;
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
    }

    clear() {
        this.pause();
        this.state = "Inited";
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
    }

    add(animation, startTime = Date.now()) {
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime);
    }

    remove() {}
}

export class Animation {
    constructor({ object, property, startValue, endValue, duration = 1000, delay = 0, timingFunction = linear, template, completeCallBack }) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction;
        this.template = template;
        this.completeCallBack = completeCallBack;
        this.runStatus = "Init";
        this.pauseTime = 0;
        this.pauseStart = 0;
    }
    receiveTime(time) {
        let range = this.endValue - this.startValue;
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template(this.startValue + range * progress);
        if (progress >= 1) {
            this.completeCallBack();
        }
    }
    reset() {
        this.object[this.property] = this.template(this.startValue);
        this.runStatus = "Init";
        this.pauseTime = 0;
    }
    pause() {
        this.runStatus = "Pause";
        this.pauseStart = Date.now();
    }
    resume() {
        if (this.runStatus !== "Pause") {
            return;
        }
        this.pauseTime += Date.now() - this.pauseStart;
        this.runStatus = "Resume";
    }
}
