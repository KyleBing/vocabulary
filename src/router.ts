import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import Vocabulary from "@/view/Vocabulary.vue";

const routes: RouteRecordRaw[] = [
    {
        name: 'Index',
        path: '/',
        component: Vocabulary,
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})



export  {
    router
}
