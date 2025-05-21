// main.ts
import {createApp} from 'vue'

// APP
import App from './App.vue'
const app = createApp(App)

// PINIA
import {createPinia} from "pinia"
const pinia = createPinia()
app.use(pinia)

// ROUTER
import {router} from "./router"
app.use(router)


// 使移动端支持 :hover 样式
document.addEventListener("touchstart", function () {
}, false)

// MOMENT
import Moment from "moment"
Moment.locale('zh', {
    week: {
        dow: 1  // 全局配置 moment，设置星期的第一天为 星期一
    }
})

app.mount('#app')
