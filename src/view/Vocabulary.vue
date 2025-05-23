<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles

const VOCABULARY_IMPORTS = {
    '初中': () => import('../vocabulary/json_original/json-sentence/BEC_2.json'),
    '高中': () => import('../vocabulary/json/2-高中-顺序.json'),
    'CET4': () => import('../vocabulary/json/3-CET4-顺序.json'),
    'CET6': () => import('../vocabulary/json/4-CET6-顺序.json'),
    '考研': () => import('../vocabulary/json/5-考研-顺序.json'),
    '托福': () => import('../vocabulary/json/6-托福-顺序.json'),
    'SAT': () => import('../vocabulary/json/7-SAT-顺序.json'),
}

const KEY_LOCALSTORAGE_KNOWN = "known_words"
const KEY_LOCALSTORAGE_UNCERTAIN = "uncertain_words"

const knownWordsSet = ref(new Set<string>())
const knownWordsArray = ref<Array<string>>([])

const uncertainWordsSet = ref(new Set<string>())
const uncertainWordsArray = ref<Array<string>>([])


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
const isSlashPressed = ref(false); // Track if / is pressed
const activeWord = ref<string | null>(null);

// Add a ref for the selected vocabulary name
const selectedVocabulary = ref('初中')

// Modify onMounted to remove URL parameter handling
onMounted(async () => {
    await loadVocabulary(selectedVocabulary.value)

    // 载入用户数据
    const knownWordsData = localStorage.getItem(KEY_LOCALSTORAGE_KNOWN)
    if (knownWordsData) {
        try {
            knownWordsArray.value = JSON.parse(knownWordsData)
            knownWordsSet.value = new Set(knownWordsArray.value)
        } catch {
            knownWordsArray.value = []
            knownWordsSet.value = new Set()
        }
    }
    const uncertainWordsData = localStorage.getItem(KEY_LOCALSTORAGE_UNCERTAIN)
    if (uncertainWordsData) {
        try {
            uncertainWordsArray.value = JSON.parse(uncertainWordsData)
            uncertainWordsSet.value = new Set(uncertainWordsArray.value)
        } catch {
            uncertainWordsArray.value = []
            uncertainWordsSet.value = new Set()
        }
    }

    // Add event listeners for keydown and keyup
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Control' || event.key === 'Meta') {
            isCtrlPressed.value = true;
        }
        if (event.key === '/' || event.keyCode === 191) {
            isSlashPressed.value = true;
        }
    });
    window.addEventListener('keyup', (event) => {
        if (event.key === 'Control' || event.key === 'Meta') {
            isCtrlPressed.value = false;
            activeWord.value = null;
        }
        if (event.key === '/' || event.keyCode === 191) {
            isSlashPressed.value = false;
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
    localStorage.setItem(KEY_LOCALSTORAGE_KNOWN, JSON.stringify(knownWordsArray.value));
}, { deep: true });

watch(uncertainWordsArray, () => {
    localStorage.setItem(KEY_LOCALSTORAGE_UNCERTAIN, JSON.stringify(uncertainWordsArray.value));
}, { deep: true });

function addKnownWord(word: string) {
    knownWordsSet.value.add(word)
    knownWordsArray.value.push(word)
}

function deleteKnownWord(word: string) {
    knownWordsSet.value.delete(word)
    knownWordsArray.value = knownWordsArray.value.filter(w => w !== word)
}

function addUncertainWord(word: string) {
    uncertainWordsSet.value.add(word)
    uncertainWordsArray.value.push(word)
}

function deleteUncertainWord(word: string) {
    uncertainWordsSet.value.delete(word)
    uncertainWordsArray.value = uncertainWordsArray.value.filter(w => w !== word)
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

// Update handleWordClick to accept event and check isSlashPressed
function handleWordClick(word: string, event?: MouseEvent) {
    if (isSlashPressed.value) {
        if (knownWordsSet.value.has(word)) {
            deleteKnownWord(word);
            addUncertainWord(word);
        } else if (!uncertainWordsSet.value.has(word)) {
            addUncertainWord(word);
        }
        return;
    }
    if (isCtrlPressed.value) {
        deleteKnownWord(word);
    } else {
        if (uncertainWordsSet.value.has(word)) {
            deleteUncertainWord(word);
            addKnownWord(word);
        } else if (!knownWordsSet.value.has(word)) {
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

        <div class="card">
            <div class="card-body">
                <div class="text-muted text-left small">掌握: {{ knownWordsSet.size }} </div>
                <div class="text-muted text-left small">未定: {{ uncertainWordsSet.size }} </div>
                <div class="text-muted text-left small">词库: {{ currentVocabulary.length }}</div>
                <hr class="my-1">
                <div class="text-muted text-center"><a target="_blank" href="https://github.com/KyleBing/vocabulary" class="small">github</a></div>
            </div>
        </div>
        <button @click="reloadPage" class="btn btn-warning btn-sm">刷新布局</button>

    </div>
    <div class="word-list">
        <div :class="[
                'word-item',
                {known: knownWordsSet.has(item.word)},
                {uncertain: uncertainWordsSet.has(item.word)},
            ]"
             @click="handleWordClick(item.word, $event)"
             @contextmenu.prevent="activeWord = item.word"
             v-for="item in wordsRandom"
             :key="item"
        >
            <div class="word">{{ item.word }}</div>
            <div class="translation-panel" v-if="activeWord === item.word">
                <div class="translation-list">
                    <div class="translation-item" v-for="translation in item.translations" :key="translation.translation">
                        <div class="type">{{ translation.type }}</div>
                        <div class="translation">{{ translation.translation }}</div>
                    </div>
                </div>
                <div class="sentence-list">
                    <div class="sentence-item" v-for="sentence in item.sentences" :key="sentence.sentence">
                        <div class="sentence-en">{{ sentence.sentence }}</div>
                        <div class="sentence-cn">{{ sentence.translation }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import "../scss/plugin";
.word-list{
    padding: 20px;
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
        &.uncertain{
            color: $green;
            //color: $orange;
        }

        .word{
            @extend .unselectable;
            // Add any specific styles for the word if needed
        }

    }
}

.translation-panel{
    min-width: 250px;
    color: white;
    z-index: 100;
    padding: 5px 5px;
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

.sentence-list{
    padding: 5px;
}

.sentence-item{
    @include border-radius(5px);
    border: 1px solid black;
    padding: 3px 5px;
    background-color: transparentize(white, 0.95);
    margin-bottom: 10px;
    text-align: left;
    &:last-child{
        margin-bottom: 0;
    }
    .sentence-en{
        margin-bottom: 3px;
        line-height: 1.3;
        font-size: 14px;
    }
    .sentence-cn{
        color: $text-subtitle;
        font-size: 13px;
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
