import { createApp, reactive } from "vue";
import App from "./App.vue";
import { initGlobalState, registerMicroApps, start } from "qiankun";

const state = reactive(Object.create(null));

const actions = initGlobalState({});
actions.onGlobalStateChange((state, prev) => {
    console.log(state, prev);
})

registerMicroApps([
    {
        name: "menu-list",
        entry: "//localhost:9001",
        container: "#menu-list",
        activeRule: "",
        props: {
            store: actions,
        },
    },
    {
        name: "menu-list-content",
        entry: "//localhost:9002",
        container: "#menu-list-content",
        activeRule: "/content",
        props: {
            store: actions,
        },
    },
]);

start({ singular: false});

let app = createApp(App);
app.config.globalProperties.$customStore = actions;
app.mount("#app");
