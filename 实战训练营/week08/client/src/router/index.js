import Vue from "vue";
import VueRouter from "vue-router";
import DesktopShare from "../views/DesktopShare.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "DesktopShare",
        component: DesktopShare,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
