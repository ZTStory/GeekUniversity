import { Component, STATE, ATTRIBUTE, createElement } from "./framework";
import { enableGesture, TapGesture } from "./gesture/gesture";

export class List extends Component {
    constructor() {
        super();
    }

    render() {
        this.children = this[ATTRIBUTE].data.map(this.template);
        this.root = (<div>{this.children}</div>).render();
        return this.root;
    }

    appendChild(child) {
        this.template = child;
        this.render();
    } 
}

export class ListItem extends Component {
    constructor() {
        super();
    }
    render() {
        this.childContainer = <span />;
        this.root = (<div>
            <img src={this[ATTRIBUTE].data.img} width={500}></img>
            <a href={this[ATTRIBUTE].data.url}>{this[ATTRIBUTE].data.title}</a>
        </div>).render();

        enableGesture(this.root);

        new TapGesture(this.root, (event) => {
            this.triggerEvent("click", {item: this[ATTRIBUTE].data});
        });

        return this.root;
    }

    appendChild(child) {
        if (!this.childContainer) {
            this.render();
        }
        this.childContainer.appendChild(child);
    }
}
