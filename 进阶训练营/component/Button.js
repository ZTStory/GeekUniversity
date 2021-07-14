import { Component, STATE, ATTRIBUTE, createElement } from "./framework";
import { enableGesture, TapGesture } from "./gesture/gesture";

export class Button extends Component {
    constructor() {
        super()
    }

    render() {
        this.childContainer = <span />;
        this.root = (<div>{ this.childContainer }</div>).render();

        enableGesture(this.root);

        new TapGesture(this.root, (event) => {
            this.triggerEvent("click", {});
        })

        return this.root;
    }

    appendChild(child) {
        if (!this.childContainer) {
            this.render();
        }
        this.childContainer.appendChild(child);
    }
}