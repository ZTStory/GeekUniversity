// listen recognize dispatch

class GestureListener {
    constructor(element, recognize) {
        let isListeningMouse = false;
        let contexts = new Map();

        element.addEventListener("mousedown", (event) => {
            let context = Object.create(null);
            contexts.set("mouse" + (1 << event.button), context);
            recognize.start(event, context);

            let mousemove = (event) => {
                let button = 1;
                while (button <= event.buttons) {
                    if (button & event.buttons) {
                        // order of (buttons & button) property is not same
                        let key;
                        if (button === 2) {
                            key = 4;
                        } else if (button === 4) {
                            key = 2;
                        } else {
                            key = button;
                        }
                        let context = contexts.get("mouse" + key);
                        recognize.move(event, context);
                    }
                    button = button << 1;
                }
            };
            let mouseup = (event) => {
                let context = contexts.get("mouse" + (1 << event.button));
                recognize.end(event, context);
                contexts.delete("mouse" + (1 << event.button));

                if (event.buttons === 0) {
                    document.removeEventListener("mousemove", mousemove);
                    document.removeEventListener("mouseup", mouseup);
                    isListeningMouse = false;
                }
            };
            if (!isListeningMouse) {
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
                isListeningMouse = true;
            }
        });

        element.addEventListener("touchstart", (event) => {
            for (const touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                recognize.start(touch, context);
            }
        });
        element.addEventListener("touchmove", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognize.move(touch, context);
            }
        });
        element.addEventListener("touchend", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognize.end(touch, context);
                contexts.delete(touch.identifier);
            }
        });
        element.addEventListener("touchcancel", (event) => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognize.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        });
    }
}

class Dispatcher {
    constructor(element) {
        this.element = element;
    }
    dispatch(type, properties) {
        let event = new Event(type);
        for (const name in properties) {
            if (Object.hasOwnProperty.call(properties, name)) {
                event[name] = properties[name];
            }
        }
        this.element.dispatchEvent(event);
    }
}

class RecognizeGesture {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    start(point, context) {
        (context.startX = point.clientX), (context.startY = point.clientY);

        this.dispatcher.dispatch("start", {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
        });

        context.points = [
            {
                t: Date.now(),
                x: point.clientX,
                y: point.clientY,
            },
        ];

        context.isPan = false;
        context.isPress = false;
        context.isTap = true;
        context.isFlick = false;

        context.handler = setTimeout(() => {
            context.isPan = false;
            context.isPress = true;
            context.isTap = false;
            context.isFlick = false;
            context.handler = null;

            this.dispatcher.dispatch("presstart", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
            });
        }, 500);
    }

    move(point, context) {
        let dx = point.clientX - context.startX,
            dy = point.clientY - context.startY;

        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true;
            context.isTap = false;
            context.isPress = false;
            context.isFlick = false;

            this.dispatcher.dispatch("panstart", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: Math.abs(dx) < Math.abs(dy),
            });
            clearTimeout(context.handler);
        }

        if (context.isPan) {
            this.dispatcher.dispatch("panmove", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                dx: dx,
                dy: dy,
                isVertical: Math.abs(dx) < Math.abs(dy),
            });
        }
        context.points = context.points.filter((point) => Date.now() - point.t < 500);
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY,
        });
    }

    end(point, context) {
        if (context.isTap) {
            this.dispatcher.dispatch("tap", {
                clientX: point.clientX,
                clientY: point.clientY,
            });
            clearTimeout(context.handler);
        }

        if (context.isPress) {
            this.dispatcher.dispatch("pressend", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
            });
        }

        context.points = context.points.filter((point) => Date.now() - point.t < 500);
        let d, v;
        if (!context.points.length) {
            v = 0;
        } else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
            v = d / (Date.now() - context.points[0].t);
        }
        if (v > 1.5) {
            context.isFlick = true;
            let dx = point.clientX - context.startX,
                dy = point.clientY - context.startY;
            let direction;
            if (Math.abs(dx) < Math.abs(dy)) {
                // 垂直
                if (dy > 0) {
                    direction = "down";
                } else {
                    direction = "up";
                }
            } else {
                // 水平
                if (dx > 0) {
                    direction = "right";
                } else {
                    direction = "left";
                }
            }
            this.dispatcher.dispatch("swipe", {
                direction,
                v,
            });
        } else {
            context.isFlick = false;
        }
        // 手势谦让
        if (context.isPan && !context.isFlick) {
            this.dispatcher.dispatch("panend", {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
            });
        }

        this.dispatcher.dispatch("end", {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
        });
    }

    cancel(point, context) {
        clearTimeout(context.handler);
    }
}

export function enableGesture(element) {
    new GestureListener(element, new RecognizeGesture(new Dispatcher(element)));
}

export class TapGesture {
    constructor(element, action) {
        this.action = action;
        this.element = element;
        element.addEventListener("tap", action);
    }
    remove() {
        this.element.removeEventListener("tap", this.action);
    }
}

export class PressGesture {
    constructor(element, action) {
        this.element = element;
        this.action = action;
        element.addEventListener("pressend", action);
    }
    remove() {
        this.element.removeEventListener("pressend", this.action);
    }
}

export class PanGesture {
    constructor(element, action) {
        this.action = action;
        this.element = element;
        element.addEventListener("start", (event) => {
            action({
                type: "start",
                ...event,
            });
        });
        element.addEventListener("panmove", (event) => {
            action({
                type: "move",
                ...event,
            });
        });
        element.addEventListener("panend", (event) => {
            action({
                type: "panend",
                ...event,
            });
        });
        element.addEventListener("end", (event) => {
            action({
                type: "end",
                ...event,
            });
        });
    }
}

export class SwipeGesture {
    constructor(element, action) {
        this.action = action;
        this.element = element;
        element.addEventListener("swipe", action);
    }
    remove() {
        this.element.removeEventListener("swipe", this.action);
    }
}
