import { defineStore } from "pinia";
console.log('pinia is loaded, inside pinia file')

export const useProjectStore = defineStore('projectStore', {
    state: ()=>({
        insets: {
            windowsHeight: window.innerHeight,
            windowsWidth: window.innerWidth,
            heightPanel: window.innerHeight - 45, // 除 navbar 的高度
        } as
            {windowsHeight: number, windowsWidth: number,heightPanel:number} ,
    }),
    getters: {

    },
    actions: {

    }
})


