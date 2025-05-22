<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles

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

// Add a ref to track if the Ctrl key is pressed and active word
const isCtrlPressed = ref(false);
const activeWord = ref<string | null>(null);

// Add a ref for the selected vocabulary name
const selectedVocabulary = ref('初中')

// Modify onMounted to remove URL parameter handling
onMounted(async () => {
    await loadVocabulary(selectedVocabulary.value)
    const storedValue = localStorage.getItem(KEY_LOCALSTORAGE_KEY)
    if (storedValue) {
        try {
            knownWordsArray.value = JSON.parse(storedValue)
            knownWordsSet.value = new Set(knownWordsArray.value)
        } catch {
            knownWordsSet.value = new Set()
        }
    }

    // Add event listeners for keydown and keyup
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Control' || event.key === 'Meta') {
            isCtrlPressed.value = true;
        }
    });
    window.addEventListener('keyup', (event) => {
        if (event.key === 'Control' || event.key === 'Meta') {
            isCtrlPressed.value = false;
            activeWord.value = null;
        }
    });
    // Add event listener for document blur
    document.addEventListener('blur', () => {
        isCtrlPressed.value = false;
        activeWord.value = null;
    });
    // Add click event listener to hide translation when clicking outside
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.word-item')) {
            activeWord.value = null;
        }
    });
})

watch(knownWordsArray, () => {
    localStorage.setItem(KEY_LOCALSTORAGE_KEY, JSON.stringify(knownWordsArray.value));
}, { deep: true });


function addKnownWord(word: string) {
    knownWordsSet.value.add(word)
    knownWordsArray.value.push(word)
}

function deleteKnownWord(word: string) {
    knownWordsSet.value.delete(word)
    knownWordsArray.value = knownWordsArray.value.filter(w => w !== word)
}

// Modify handleVocabularyChange to remove URL update
async function handleVocabularyChange(event: Event) {
    const select = event.target as HTMLSelectElement
    selectedVocabulary.value = select.value
    await loadVocabulary(selectedVocabulary.value)
}

// Modify reloadPage function to just shuffle
function reloadPage() {
    currentVocabulary.value = [...currentVocabulary.value] // Create new array to trigger reactivity
}

// Add a method to handle word click
function handleWordClick(word: string) {
    if (isCtrlPressed.value) {
        deleteKnownWord(word);
    } else {
        if (!knownWordsSet.value.has(word)) {
            addKnownWord(word);
        }
    }
}
</script>

<template>
    <div class="select-container">
        <select v-model="selectedVocabulary" @change="handleVocabularyChange" class="form-select form-select-sm">
            <option v-for="(_, name) in VOCABULARY_IMPORTS" :key="name" :value="name">{{ name }}</option>
        </select>
        <button @click="reloadPage" class="btn btn-primary btn-sm">刷新布局</button>
        <div class="card">
            <div class="card-body">
                <div class="text-muted">已标数量: {{ knownWordsSet.size }} </div>
                <div class="text-muted">当前词库: {{ currentVocabulary.length }}</div>
                <hr class="my-2">
                <div class="text-muted"><a target="_blank" href="https://github.com/KyleBing/vocabulary">github</a></div>
            </div>
        </div>
    </div>
    <div class="word-list">
        <div :class="['word-item', {known: knownWordsSet.has(item.word)}]"
             @click="handleWordClick(item.word)"
             @contextmenu.prevent="activeWord = item.word"
             v-for="item in wordsRandom"
             :key="item"
        >
            <div class="word">{{ item.word }}</div>
            <div class="translation-panel" v-if="activeWord === item.word">
                <div class="translation-item" v-for="translation in item.translations" :key="translation.translation">
                    <div class="type">{{ translation.type }}</div>
                    <div class="translation">{{ translation.translation }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "@/scss/plugin";
.word-list{
    padding-bottom: 100px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .word-item{
        position: relative;
        @include border-radius(10px);
        font-size: 24px;
        cursor: pointer;
        padding: 8px 15px;
        line-height: 1;
        color: white;
        &:hover{
            background-color: transparentize(white, 0.9);
            .translation-panel {
                display: block;
            }
        }
        &:active{
            background-color: transparentize(white, 0.5);
        }
        &.known{
            color: transparentize(white, 0.8);
        }

        .word{
            @extend .unselectable;
            // Add any specific styles for the word if needed
        }
        .translation-panel{
            min-width: 150px;
            color: white;
            z-index: 100;
            padding: 3px 5px;
            @include border-radius(5px);
            background-color: transparentize(black, 0.3);
            backdrop-filter: blur(10px);
            line-height: 1.3;
            text-align: center;
            position: absolute;
            top: 100%;
            left: 0;
            font-size: 13px;
            display: none; // Hide translation by default
        }
    }
}
.translation-item{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .type{
        width: 30px;
        flex-shrink: 0;
        color: $green;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .translation{
        flex-grow: 1;
        text-align: left;
    }
}

.select-container {
    z-index: 999;
    text-align: center;
    position: fixed;
    top: 30px;
    left: 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
