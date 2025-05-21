<script setup lang="ts">
import cet4 from "../vocabulary/CET4.json"
import {computed, onMounted, ref, watch} from "vue";

const wordsKnow = ref<String[]>([])

const wordsRandom = computed(() => {
    return shuffle(cet4)
})

/**
 * 数组乱序算法
 */
function shuffle(arr: Array<any>) {
    let length = arr.length,
        r = length,
        rand = 0;

    while (r) {
        rand = Math.floor(Math.random() * r--);
        [arr[r], arr[rand]] = [arr[rand], arr[r]];
    }
    return arr;
}

onMounted(() => {
    const storedValue = localStorage.getItem('wordsKnow')

    if (storedValue) {
        try {
            wordsKnow.value = JSON.parse(storedValue)
        } catch {
            wordsKnow.value = []
        }
    }
})

watch(wordsKnow, () => {
    localStorage.setItem("wordsKnow", JSON.stringify(wordsKnow.value));
}, {deep: true})
</script>

<template>
    <div class="word-list">
        <div :class="['word', {known: wordsKnow.includes(item.word)}]"
             @click="wordsKnow.push(item.word)"
             v-for="item in wordsRandom"
             :key="item"
        >{{ item.word }}
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "@/scss/plugin";
.word-list{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .word{
        @include border-radius(10px);
        font-size: 24px;
        cursor: pointer;
        padding: 8px 15px;
        color: white;
        &:hover{
            background-color: transparentize(white, 0.9);
        }
        &:active{
            background-color: transparentize(white, 0.5);
        }
        &.known{
            color: transparentize(white, 0.5);
        }
    }
}
</style>