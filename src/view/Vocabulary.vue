<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";

const VOCABULARY_IMPORTS = {
    '初中': () => import('../vocabulary/json/1-初中-顺序.json'),
    '高中': () => import('../vocabulary/json/2-高中-顺序.json'),
    'CET4': () => import('../vocabulary/json/3-CET4-顺序.json'),
    'CET6': () => import('../vocabulary/json/4-CET6-顺序.json'),
    '考研': () => import('../vocabulary/json/5-考研-顺序.json'),
    '托福': () => import('../vocabulary/json/6-托福-顺序.json'),
    'SAT': () => import('../vocabulary/json/7-SAT-顺序.json'),
}


const KEY_LOCALSTORAGE_KEY = "known_words"

const knownWordsSet = ref(new Set<string>())
const knownWordsArray = ref<Array<string>>([])


const currentVocabulary = ref<any[]>([])

const wordsRandom = computed(() => {
    return shuffle(currentVocabulary.value)
    // return currentVocabulary.value
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

async function loadVocabulary(name: string) {
    const module = await VOCABULARY_IMPORTS[name]()
    currentVocabulary.value = module.default
}

onMounted(async () => {
    await loadVocabulary('初中')
    const storedValue = localStorage.getItem(KEY_LOCALSTORAGE_KEY)
    if (storedValue) {
        try {
            knownWordsArray.value = JSON.parse(storedValue)
            knownWordsSet.value = new Set(knownWordsArray.value)
        } catch {
            knownWordsSet.value = new Set()
        }
    }
})

watch(knownWordsArray, () => {
    localStorage.setItem(KEY_LOCALSTORAGE_KEY, JSON.stringify(knownWordsArray.value));
}, { deep: true });


function addKnownWord(word: string) {
    knownWordsSet.value.add(word)
    knownWordsArray.value.push(word)
}
</script>

<template>
    <div class="word-list">
        <div :class="['word', {known: knownWordsSet.has(item.word)}]"
             @click="addKnownWord(item.word)"
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
        @extend .unselectable;
        &:hover{
            background-color: transparentize(white, 0.9);
        }
        &:active{
            background-color: transparentize(white, 0.5);
        }
        &.known{
            color: transparentize(white, 0.8);
        }
    }
}
</style>