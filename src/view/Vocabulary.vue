<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles
import Clipboard from 'clipboard';

const VOCABULARY_IMPORTS = {
    '简单单词': {
        '初中': () => import('../vocabulary/json/1-初中-顺序.json'),
        '高中': () => import('../vocabulary/json/2-高中-顺序.json'),
        'CET4': () => import('../vocabulary/json/3-CET4-顺序.json'),
        'CET6': () => import('../vocabulary/json/4-CET6-顺序.json'),
        '考研': () => import('../vocabulary/json/5-考研-顺序.json'),
        '托福': () => import('../vocabulary/json/6-托福-顺序.json'),
        'SAT': () => import('../vocabulary/json/7-SAT-顺序.json'),
    },
    '小学 - 含例句': {
        '人教版小学三年级1': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue3_1.json'),
        '人教版小学三年级2': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue3_2.json'),
        '人教版小学四年级1': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue4_1.json'),
        '人教版小学四年级2': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue4_2.json'),
        '人教版小学五年级1': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue5_1.json'),
        '人教版小学五年级2': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue5_2.json'),
        '人教版小学六年级1': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue6_1.json'),
        '人教版小学六年级2': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue6_2.json'),
    },
    '初中 - 含例句': {
        '人教版初中七年级1': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong7_1.json'),
        '人教版初中七年级2': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong7_2.json'),
        '人教版初中八年级1': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong8_1.json'),
        '人教版初中八年级2': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong8_2.json'),
        '人教版初中九年级': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong9_1.json'),
        '外研社初中一年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_1.json'),
        '外研社初中二年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_2.json'),
        '外研社初中三年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_3.json'),
        '外研社初中四年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_4.json'),
        '外研社初中五年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_5.json'),
        '外研社初中六年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_6.json'),
    },
    '高中 - 含例句': {
        '人教版高中必修1': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_1.json'),
        '人教版高中必修2': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_2.json'),
        '人教版高中必修3': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_3.json'),
        '人教版高中必修4': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_4.json'),
        '人教版高中必修5': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_5.json'),
        '人教版高中选修6': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_6.json'),
        '人教版高中选修7': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_7.json'),
        '人教版高中选修8': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_8.json'),
        '人教版高中选修9': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_9.json'),
        '人教版高中选修10': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_10.json'),
        '人教版高中选修11': () => import('../vocabulary/json_original/json-sentence/PEPGaoZhong_11.json'),
        '北师大版高中必修1': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_1.json'),
        '北师大版高中必修2': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_2.json'),
        '北师大版高中必修3': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_3.json'),
        '北师大版高中必修4': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_4.json'),
        '北师大版高中必修5': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_5.json'),
        '北师大版高中选修6': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_6.json'),
        '北师大版高中选修7': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_7.json'),
        '北师大版高中选修8': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_8.json'),
        '北师大版高中选修9': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_9.json'),
        '北师大版高中选修10': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_10.json'),
        '北师大版高中选修11': () => import('../vocabulary/json_original/json-sentence/BeiShiGaoZhong_11.json'),
    },
    '大学 - 含例句': {
        '四级真题核心词': () => import('../vocabulary/json_original/json-sentence/CET4_1.json'),
        '四级英语词汇': () => import('../vocabulary/json_original/json-sentence/CET4_2.json'),
        '六级真题核心词': () => import('../vocabulary/json_original/json-sentence/CET6_1.json'),
        '六级英语词汇': () => import('../vocabulary/json_original/json-sentence/CET6_2.json'),
        '考研必考词汇': () => import('../vocabulary/json_original/json-sentence/KaoYan_1.json'),
        '考研英语词汇': () => import('../vocabulary/json_original/json-sentence/KaoYan_2.json'),
    },
    '国际考试 - 含例句': {
        'TOEFL 词汇': () => import('../vocabulary/json_original/json-sentence/TOEFL_2.json'),
        '雅思词汇': () => import('../vocabulary/json_original/json-sentence/IELTS_2.json'),
        'SAT 词汇': () => import('../vocabulary/json_original/json-sentence/SAT_2.json'),
        'GRE 词汇': () => import('../vocabulary/json_original/json-sentence/GRE_2.json'),
        'GMAT 词汇': () => import('../vocabulary/json_original/json-sentence/GMAT_2.json'),
        '商务英语词汇': () => import('../vocabulary/json_original/json-sentence/BEC_2.json'),
        '专四核心词汇-1': () => import('../vocabulary/json_original/json-sentence/Level4_1.json'),
        '专四核心词汇-2': () => import('../vocabulary/json_original/json-sentence/Level4_2.json'),
        '专八核心词汇-1': () => import('../vocabulary/json_original/json-sentence/Level8_1.json'),
        '专八核心词汇-2': () => import('../vocabulary/json_original/json-sentence/Level8_2.json'),
    },
    // '乱序版': {
    //     '初中乱序版': () => import('../vocabulary/json_original/json-sentence/ChuZhongluan_2.json'),
    //     '高中乱序版': () => import('../vocabulary/json_original/json-sentence/GaoZhongluan_2.json'),
    //     'CET4乱序版1': () => import('../vocabulary/json_original/json-sentence/CET4luan_1.json'),
    //     'CET4乱序版2': () => import('../vocabulary/json_original/json-sentence/CET4luan_2.json'),
    //     'CET6乱序版': () => import('../vocabulary/json_original/json-sentence/CET6luan_1.json'),
    //     '考研乱序版': () => import('../vocabulary/json_original/json-sentence/KaoYanluan_1.json'),
    //     '雅思乱序版': () => import('../vocabulary/json_original/json-sentence/IELTSluan_2.json'),
    //     'GMAT乱序版': () => import('../vocabulary/json_original/json-sentence/GMATluan_2.json'),
    //     'Level4乱序版1': () => import('../vocabulary/json_original/json-sentence/Level4luan_1.json'),
    //     'Level4乱序版2': () => import('../vocabulary/json_original/json-sentence/Level4luan_2.json'),
    //     'Level8乱序版': () => import('../vocabulary/json_original/json-sentence/Level8luan_2.json'),
    // },
    '新东方': {
        '初中词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/ChuZhong_3.json'),
        '高中词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GaoZhong_3.json'),
        '四级词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/CET4_3.json'),
        '六级词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/CET6_3.json'),
        '考研词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/KaoYan_3.json'),
        'TOEFL 词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/TOEFL_3.json'),
        '雅思词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/IELTS_3.json'),
        'SAT 词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/SAT_3.json'),
        'GRE 词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GRE_3.json'),
        'GMAT 词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GMAT_3.json'),
        'BEC 词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/BEC_3.json'),
    }
}

const KEY_LOCALSTORAGE_KNOWN = "known_words"
const KEY_LOCALSTORAGE_UNCERTAIN = "uncertain_words"
const KEY_LOCALSTORAGE_LAST_VOCABULARY = "last_vocabulary"

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
    // Find the group and module that contains the selected vocabulary
    for (const group of Object.values(VOCABULARY_IMPORTS)) {
        if (name in group) {
            const module = await group[name]()
            currentVocabulary.value = module.default
            return
        }
    }
}

// Add a ref to track if the Ctrl key is pressed and active word
const isCtrlPressed = ref(false);
const isSlashPressed = ref(false); // Track if / is pressed
const activeWord = ref<string | null>(null);
const panelPosition = ref({ left: 0 });

// Add a ref for the selected vocabulary name
const selectedVocabulary = ref('初中')

// Modify onMounted to load last vocabulary
onMounted(async () => {
    // Load last selected vocabulary
    const lastVocabulary = localStorage.getItem(KEY_LOCALSTORAGE_LAST_VOCABULARY)
    if (lastVocabulary) {
        selectedVocabulary.value = lastVocabulary
    }
    
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

// Add watch for selectedVocabulary
watch(selectedVocabulary, (newValue) => {
    localStorage.setItem(KEY_LOCALSTORAGE_LAST_VOCABULARY, newValue)
})

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

function calculatePanelPosition(event: MouseEvent) {
    const wordElement = event.currentTarget as HTMLElement;
    const panelWidth = 300; // min-width from CSS
    const screenWidth = window.innerWidth;
    const offsetLeft = wordElement.offsetLeft;

    if (screenWidth > offsetLeft + panelWidth) {
        panelPosition.value.left = 0;
    } else {
        panelPosition.value.left = offsetLeft + panelWidth - screenWidth + 30;
    }
}

function exportConfigToClipboard() {
    // Deduplicate each array independently
    const uniqueKnown = Array.from(new Set(knownWordsArray.value));
    const uniqueUncertain = Array.from(new Set(uncertainWordsArray.value));
    
    const config = {
        known: uniqueKnown,
        uncertain: uniqueUncertain,
        lastVocabulary: selectedVocabulary.value
    };
    const json = JSON.stringify(config, null, 2);
    const tempBtn = document.createElement('button');
    tempBtn.setAttribute('data-clipboard-text', json);
    document.body.appendChild(tempBtn);
    const clipboard = new Clipboard(tempBtn);
    tempBtn.click();
    clipboard.destroy();
    document.body.removeChild(tempBtn);
    alert('配置已复制到剪贴板！');
}

async function importConfigFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const config = JSON.parse(text);
        if (Array.isArray(config.known) && Array.isArray(config.uncertain)) {
            knownWordsArray.value = config.known;
            knownWordsSet.value = new Set(config.known);
            uncertainWordsArray.value = config.uncertain;
            uncertainWordsSet.value = new Set(config.uncertain);
            localStorage.setItem(KEY_LOCALSTORAGE_KNOWN, JSON.stringify(config.known));
            localStorage.setItem(KEY_LOCALSTORAGE_UNCERTAIN, JSON.stringify(config.uncertain));
            
            // Import last vocabulary if it exists
            if (config.lastVocabulary) {
                selectedVocabulary.value = config.lastVocabulary;
                await loadVocabulary(config.lastVocabulary);
            }
            
            alert('配置已导入！');
        } else {
            alert('剪贴板内容格式不正确');
        }
    } catch (e) {
        alert('读取或解析剪贴板内容失败');
    }
}
</script>

<template>
    <div class="select-container">
        <select v-model="selectedVocabulary" @change="handleVocabularyChange" class="form-select form-select-sm">
            <optgroup v-for="(group, groupName) in VOCABULARY_IMPORTS" :key="groupName" :label="groupName">
                <option v-for="(_, name) in group" :key="name" :value="name" :selected="name === selectedVocabulary">{{ name }}</option>
            </optgroup>
        </select>
        <button @click="exportConfigToClipboard" class="btn btn-secondary btn-sm">导出配置</button>
        <button @click="importConfigFromClipboard" class="btn btn-secondary btn-sm">导入配置</button>
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
             @contextmenu.prevent="(e) => { activeWord = item.word; calculatePanelPosition(e); }"
             v-for="item in wordsRandom"
             :key="item"
        >
            <div class="word">{{ item.word }}</div>


            <div class="translation-panel" v-if="activeWord === item.word" :style="`left: ${-panelPosition.left}px`">
                <div class="translation-list">
                    <div class="translation-item" v-for="translation in item.translations" :key="translation.translation">
                        <div class="type">{{ translation.type }}</div>
                        <div class="translation">{{ translation.translation }}</div>
                    </div>
                </div>
                <div class="sentence-list" v-if="item.sentences && item.sentences.length > 0">
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
    padding: 20px 10px 300px;
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
    //border: 1px solid transparentize(white, 0.9);
    border: 1px solid transparentize(white, 0.7);
    min-width: 300px;
    color: white;
    z-index: 100;
    padding: 5px 5px;
    @include border-radius(9px);
    background-color: transparentize(black, 0.2);
    backdrop-filter: blur(10px);
    line-height: 1.3;
    text-align: center;
    position: absolute;
    top: 100%;
    left: 0;
    font-size: 1rem;
    display: none; // Hide translation by default
}

.sentence-list{
    padding: 5px;
}

.sentence-item{
    @include border-radius(5px);
    border: 1px solid transparentize(white, 0.9);
    padding: 3px 5px;
    background-color: transparentize(white, 0.95);
    margin-bottom: 6px;
    text-align: left;
    &:last-child{
        margin-bottom: 0;
    }
    .sentence-en{
        margin-bottom: 3px;
        line-height: 1.3;
        font-size: 1rem;
        font-family: Arial, sans-serif;
    }
    .sentence-cn{
        color: $text-subtitle;
        font-size: 0.9rem;
    }
}

.translation-list{
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
