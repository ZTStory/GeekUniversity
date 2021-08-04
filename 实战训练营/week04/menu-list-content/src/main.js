import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";

let instance = null;

function render(props = {}) {
    const { container, store } = props;
    instance = createApp(App);
    if (store) {
        instance.config.globalProperties.$customStore = store;
    }
    instance.mount(container ? container.querySelector("#app") : "#app");
}

if (!window.__POWERED_BY_QIANKUN__) {
    render();
}

export async function bootstrap() {
    console.log("[vue] menu-list-content app bootstraped");
}
export async function mount(props) {
    console.log("[vue] props from main framework", props);
    render(props);
}
export async function unmount() {
    instance.$destroy();
    instance.$el.innerHTML = "";
    instance = null;
}
