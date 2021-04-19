class ToyVue {
    constructor(config) {
        this.template = document.querySelector(config.el);
        this.data = config.data;
    }
}

let effects = new Map();

let currentEffect = null;

function effect(fn) {
    currentEffect = fn;
    fn();
    currentEffect = null;
}

function reactive(object) {
    let observed = new Proxy(object, {
        get(object, property) {
            if (currentEffect) {
                if (!effect.has(object)) {
                    effect.set(object, new Map());
                }
                if (!effect.get(object).has(property)) {
                    effect.get(object).set(property, new Array());
                }
                effects.get(object).get(property).push(currentEffect);
            }
            return object[property];
        },
        set(object, property, value) {
            object[property] = value;
            effects?.get(object)?.get(property);
            return value;
        },
    });
    return observed;
}

let dummy;
const counter = reactive({ num: 0 });
effect(() => {
    dummy = counter.num;
});
console.log(dummy);
counter.num = 7;
console.log(dummy);
