<script setup lang="ts">
import {computed, onMounted, onUnmounted, nextTick, ref, watch} from "vue";
import Clipboard from 'clipboard';

type Translation = { translation: string; type?: string }
type Phrase = { phrase: string; translation: string }
type Sentence = { sentence: string; translation: string }
type VocabItem = {
    word: string
    us?: string
    uk?: string
    translations?: Translation[]
    phrases?: Phrase[]
    sentences?: Sentence[]
}
type FilterMode = 'all' | 'review'

const VOCABULARY_IMPORTS = {
    '基础词汇': {
        '初中词汇': () => import('../vocabulary/json/1-初中-顺序.json'),
        '高中词汇': () => import('../vocabulary/json/2-高中-顺序.json'),
        '四级词汇': () => import('../vocabulary/json/3-CET4-顺序.json'),
        '六级词汇': () => import('../vocabulary/json/4-CET6-顺序.json'),
        '考研词汇': () => import('../vocabulary/json/5-考研-顺序.json'),
        '托福词汇': () => import('../vocabulary/json/6-托福-顺序.json'),
        'SAT词汇': () => import('../vocabulary/json/7-SAT-顺序.json'),
    },
    '小学词汇': {
        '人教版小学三年级上册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue3_1.json'),
        '人教版小学三年级下册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue3_2.json'),
        '人教版小学四年级上册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue4_1.json'),
        '人教版小学四年级下册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue4_2.json'),
        '人教版小学五年级上册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue5_1.json'),
        '人教版小学五年级下册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue5_2.json'),
        '人教版小学六年级上册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue6_1.json'),
        '人教版小学六年级下册': () => import('../vocabulary/json_original/json-sentence/PEPXiaoXue6_2.json'),
    },
    '初中词汇': {
        '人教版初中七年级上册': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong7_1.json'),
        '人教版初中七年级下册': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong7_2.json'),
        '人教版初中八年级上册': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong8_1.json'),
        '人教版初中八年级下册': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong8_2.json'),
        '人教版初中九年级': () => import('../vocabulary/json_original/json-sentence/PEPChuZhong9_1.json'),
        '外研社初中一年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_1.json'),
        '外研社初中二年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_2.json'),
        '外研社初中三年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_3.json'),
        '外研社初中四年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_4.json'),
        '外研社初中五年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_5.json'),
        '外研社初中六年级': () => import('../vocabulary/json_original/json-sentence/WaiYanSheChuZhong_6.json'),
    },
    '高中词汇': {
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
    '大学词汇': {
        '四级真题核心词': () => import('../vocabulary/json_original/json-sentence/CET4_1.json'),
        '四级英语词汇': () => import('../vocabulary/json_original/json-sentence/CET4_2.json'),
        '六级真题核心词': () => import('../vocabulary/json_original/json-sentence/CET6_1.json'),
        '六级英语词汇': () => import('../vocabulary/json_original/json-sentence/CET6_2.json'),
        '考研必考词汇': () => import('../vocabulary/json_original/json-sentence/KaoYan_1.json'),
        '考研英语词汇': () => import('../vocabulary/json_original/json-sentence/KaoYan_2.json'),
    },
    '国际考试': {
        'TOEFL词汇': () => import('../vocabulary/json_original/json-sentence/TOEFL_2.json'),
        '雅思词汇': () => import('../vocabulary/json_original/json-sentence/IELTS_2.json'),
        'SAT词汇': () => import('../vocabulary/json_original/json-sentence/SAT_2.json'),
        'GRE词汇': () => import('../vocabulary/json_original/json-sentence/GRE_2.json'),
        'GMAT词汇': () => import('../vocabulary/json_original/json-sentence/GMAT_2.json'),
        '商务英语词汇': () => import('../vocabulary/json_original/json-sentence/BEC_2.json'),
        '专四核心词汇-1': () => import('../vocabulary/json_original/json-sentence/Level4_1.json'),
        '专四核心词汇-2': () => import('../vocabulary/json_original/json-sentence/Level4_2.json'),
        '专八核心词汇-1': () => import('../vocabulary/json_original/json-sentence/Level8_1.json'),
        '专八核心词汇-2': () => import('../vocabulary/json_original/json-sentence/Level8_2.json'),
    },
    '新东方': {
        '初中词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/ChuZhong_3.json'),
        '高中词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GaoZhong_3.json'),
        '四级词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/CET4_3.json'),
        '六级词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/CET6_3.json'),
        '考研词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/KaoYan_3.json'),
        'TOEFL词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/TOEFL_3.json'),
        '雅思词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/IELTS_3.json'),
        'SAT词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/SAT_3.json'),
        'GRE词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GRE_3.json'),
        'GMAT词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/GMAT_3.json'),
        'BEC词汇（新东方）': () => import('../vocabulary/json_original/json-sentence/BEC_3.json'),
    }
}

const KEY_LOCALSTORAGE_KNOWN = "known_words"
const KEY_LOCALSTORAGE_UNCERTAIN = "uncertain_words"
const KEY_LOCALSTORAGE_LAST_VOCABULARY = "last_vocabulary"
const KEY_LOCALSTORAGE_FILTER = "vocabulary_filter"
const DEFAULT_VOCABULARY = "初中词汇"

const knownWordsSet = ref(new Set<string>())
const knownWordsArray = ref<Array<string>>([])
const uncertainWordsSet = ref(new Set<string>())
const uncertainWordsArray = ref<Array<string>>([])

const currentVocabulary = ref<VocabItem[]>([])
const shuffledWords = ref<VocabItem[]>([])
const loading = ref(true)
const selectedVocabulary = ref(DEFAULT_VOCABULARY)
const filterMode = ref<FilterMode>('all')

const activeItem = ref<VocabItem | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelPos = ref({ left: 16, top: 72 })
const toolbarRef = ref<HTMLElement | null>(null)
const pixelMapRef = ref<HTMLCanvasElement | null>(null)
const toast = ref('')
let toastTimer = 0
let pixelMapObserver: ResizeObserver | null = null
let pixelMapCols = 0
let pixelMapRows = 0
let pixelMapMaxRows = 0
const wordIndexMap = new Map<string, number>()

const PIXEL_KNOWN = '#4CD964'
const PIXEL_UNCERTAIN = '#FF9500'
const PIXEL_NEW = 'rgba(255,255,255,0.16)'

const isCtrlPressed = ref(false)
const isSlashPressed = ref(false)

const vocabularyNames = Object.values(VOCABULARY_IMPORTS).flatMap(group => Object.keys(group))

const bookStats = computed(() => {
    let known = 0
    let uncertain = 0
    for (const item of currentVocabulary.value) {
        if (knownWordsSet.value.has(item.word)) known++
        else if (uncertainWordsSet.value.has(item.word)) uncertain++
    }
    const total = currentVocabulary.value.length
    return { known, uncertain, total }
})

const visibleWords = computed(() => {
    if (filterMode.value !== 'review') return shuffledWords.value
    return shuffledWords.value.filter(item => uncertainWordsSet.value.has(item.word))
})

const activePhrases = computed(() => (activeItem.value?.phrases || []).filter(item => item.phrase).slice(0, 4))
const activeSentences = computed(() => (activeItem.value?.sentences || []).filter(item => item.sentence).slice(0, 2))

const emptyHint = computed(() => {
    if (loading.value) return '词库加载中…'
    if (!currentVocabulary.value.length) return '没有找到这本词库'
    if (filterMode.value === 'review') return '还没有待复习的词。按住 / 再点单词，标「再看」。'
    return ''
})

function shuffle<T>(arr: Array<T>): T[] {
    const copy = [...arr]
    let r = copy.length
    while (r) {
        const rand = Math.floor(Math.random() * r--)
        const current = copy[r]
        copy[r] = copy[rand]
        copy[rand] = current
    }
    return copy
}

function resolveVocabularyName(name: string | null) {
    if (name && vocabularyNames.includes(name)) return name
    return DEFAULT_VOCABULARY
}

function showToast(message: string) {
    toast.value = message
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
        toast.value = ''
    }, 2200)
}

function speakWord(word: string) {
    if (!word || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.92
    utterance.volume = 0.8
    window.speechSynthesis.speak(utterance)
}

async function loadVocabulary(name: string) {
    loading.value = true
    activeItem.value = null
    for (const group of Object.values(VOCABULARY_IMPORTS)) {
        if (name in group) {
            const module = await group[name]()
            const list = module.default as VocabItem[]
            currentVocabulary.value = list
            shuffledWords.value = shuffle(list)
            loading.value = false
            return
        }
    }
    currentVocabulary.value = []
    shuffledWords.value = []
    loading.value = false
}

function reshuffle() {
    shuffledWords.value = shuffle(currentVocabulary.value)
    activeItem.value = null
}

function pixelColorFor(word: string) {
    if (knownWordsSet.value.has(word)) return PIXEL_KNOWN
    if (uncertainWordsSet.value.has(word)) return PIXEL_UNCERTAIN
    return PIXEL_NEW
}

function rebuildWordIndexMap() {
    wordIndexMap.clear()
    currentVocabulary.value.forEach((item, index) => {
        wordIndexMap.set(item.word, index)
    })
}

function paintPixelAt(index: number) {
    const canvas = pixelMapRef.value
    if (!canvas || pixelMapCols <= 0) return
    const item = currentVocabulary.value[index]
    if (!item) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = pixelColorFor(item.word)
    ctx.fillRect(index % pixelMapCols, Math.floor(index / pixelMapCols), 1, 1)
}

function updatePixelForWord(word: string) {
    const index = wordIndexMap.get(word)
    if (index === undefined) return
    paintPixelAt(index)
}

function repaintPixelMapColors() {
    const canvas = pixelMapRef.value
    if (!canvas || pixelMapCols <= 0) return
    const words = currentVocabulary.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    for (let i = 0; i < words.length; i++) {
        ctx.fillStyle = pixelColorFor(words[i].word)
        ctx.fillRect(i % pixelMapCols, Math.floor(i / pixelMapCols), 1, 1)
    }
}

function getHeaderContentHeight() {
    const toolbar = toolbarRef.value
    if (!toolbar) return 28
    let max = 0
    for (const child of Array.from(toolbar.children)) {
        if ((child as HTMLElement).classList.contains('pixel-overview')) continue
        max = Math.max(max, (child as HTMLElement).offsetHeight)
    }
    return Math.max(1, max || 28)
}

function drawPixelMap(force = false) {
    const canvas = pixelMapRef.value
    if (!canvas) return
    const words = currentVocabulary.value
    const total = words.length
    const maxRows = getHeaderContentHeight()
    if (!total) {
        pixelMapCols = 0
        pixelMapRows = 0
        pixelMapMaxRows = maxRows
        wordIndexMap.clear()
        canvas.width = 1
        canvas.height = 1
        canvas.style.width = '1px'
        canvas.style.height = '1px'
        return
    }
    // Height locked to header controls; width derived so 1px/word fits without stretching header.
    const cols = Math.max(1, Math.ceil(total / maxRows))
    const rows = Math.ceil(total / cols)
    if (!force && cols === pixelMapCols && rows === pixelMapRows && maxRows === pixelMapMaxRows && wordIndexMap.size === total) {
        return
    }
    pixelMapCols = cols
    pixelMapRows = rows
    pixelMapMaxRows = maxRows
    rebuildWordIndexMap()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(cols * dpr)
    canvas.height = Math.floor(rows * dpr)
    canvas.style.width = `${cols}px`
    canvas.style.height = `${rows}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cols, rows)
    for (let i = 0; i < total; i++) {
        ctx.fillStyle = pixelColorFor(words[i].word)
        ctx.fillRect(i % cols, Math.floor(i / cols), 1, 1)
    }
}

function addKnownWord(word: string) {
    knownWordsSet.value.add(word)
    knownWordsArray.value.push(word)
    updatePixelForWord(word)
}

function deleteKnownWord(word: string) {
    knownWordsSet.value.delete(word)
    knownWordsArray.value = knownWordsArray.value.filter(w => w !== word)
    updatePixelForWord(word)
}

function addUncertainWord(word: string) {
    uncertainWordsSet.value.add(word)
    uncertainWordsArray.value.push(word)
    updatePixelForWord(word)
}

function deleteUncertainWord(word: string) {
    uncertainWordsSet.value.delete(word)
    uncertainWordsArray.value = uncertainWordsArray.value.filter(w => w !== word)
    updatePixelForWord(word)
}

async function placePanel(anchor: HTMLElement) {
    await nextTick()
    const panel = panelRef.value
    const rect = anchor.getBoundingClientRect()
    const margin = 10
    const width = panel?.offsetWidth || 340
    const height = panel?.offsetHeight || 280
    let left = rect.left
    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin
    if (left < margin) left = margin
    let top = rect.bottom + 8
    if (top + height > window.innerHeight - margin) {
        const above = rect.top - height - 8
        top = above >= margin ? above : Math.max(margin, window.innerHeight - height - margin)
    }
    panelPos.value = { left, top }
}

function handleWordHover(word: string) {
    speakWord(word)
}

function handleWordClick(item: VocabItem) {
    speakWord(item.word)
    if (isSlashPressed.value) {
        if (knownWordsSet.value.has(item.word)) {
            deleteKnownWord(item.word)
            addUncertainWord(item.word)
        } else if (!uncertainWordsSet.value.has(item.word)) {
            addUncertainWord(item.word)
        }
        return
    }
    if (isCtrlPressed.value) {
        deleteKnownWord(item.word)
        return
    }
    if (uncertainWordsSet.value.has(item.word)) {
        deleteUncertainWord(item.word)
        addKnownWord(item.word)
    } else if (!knownWordsSet.value.has(item.word)) {
        addKnownWord(item.word)
    }
}

function handleWordContextMenu(item: VocabItem, event: MouseEvent) {
    event.preventDefault()
    activeItem.value = item
    placePanel(event.currentTarget as HTMLElement)
}

async function handleVocabularyChange(event: Event) {
    const select = event.target as HTMLSelectElement
    selectedVocabulary.value = select.value
    await loadVocabulary(selectedVocabulary.value)
}

function setFilter(mode: FilterMode) {
    filterMode.value = mode
    activeItem.value = null
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 'Meta') {
        isCtrlPressed.value = true
    }
    if (event.key === '/' || event.keyCode === 191) {
        isSlashPressed.value = true
    }
    if (event.key === 'Escape') {
        activeItem.value = null
    }
}

function onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control' || event.key === 'Meta') {
        isCtrlPressed.value = false
        activeItem.value = null
    }
    if (event.key === '/' || event.keyCode === 191) {
        isSlashPressed.value = false
    }
}

function onDocumentBlur() {
    isCtrlPressed.value = false
    activeItem.value = null
}

function onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.word-item') && !target.closest('.detail-panel')) {
        activeItem.value = null
    }
}

function onWindowScroll() {
    if (activeItem.value) activeItem.value = null
}

function exportConfigToClipboard() {
    const config = {
        known: Array.from(new Set(knownWordsArray.value)),
        uncertain: Array.from(new Set(uncertainWordsArray.value)),
        lastVocabulary: selectedVocabulary.value
    }
    const json = JSON.stringify(config, null, 2)
    const write = navigator.clipboard?.writeText(json)
    if (write) {
        write.then(() => showToast('配置已复制')).catch(() => copyWithClipboard(json))
        return
    }
    copyWithClipboard(json)
}

function copyWithClipboard(text: string) {
    const tempBtn = document.createElement('button')
    tempBtn.setAttribute('data-clipboard-text', text)
    document.body.appendChild(tempBtn)
    const clipboard = new Clipboard(tempBtn)
    tempBtn.click()
    clipboard.destroy()
    document.body.removeChild(tempBtn)
    showToast('配置已复制')
}

async function importConfigFromClipboard() {
    try {
        const text = await navigator.clipboard.readText()
        const config = JSON.parse(text)
        if (!Array.isArray(config.known) || !Array.isArray(config.uncertain)) {
            showToast('剪贴板内容格式不对')
            return
        }
        const known = config.known.filter((word: unknown) => typeof word === 'string')
        const uncertain = config.uncertain.filter((word: unknown) => typeof word === 'string' && !known.includes(word))
        knownWordsArray.value = known
        knownWordsSet.value = new Set(known)
        uncertainWordsArray.value = uncertain
        uncertainWordsSet.value = new Set(uncertain)
        if (config.lastVocabulary) {
            selectedVocabulary.value = resolveVocabularyName(config.lastVocabulary)
            await loadVocabulary(selectedVocabulary.value)
        } else {
            repaintPixelMapColors()
        }
        showToast('配置已导入')
    } catch {
        showToast('读取剪贴板失败')
    }
}

watch(knownWordsArray, () => {
    localStorage.setItem(KEY_LOCALSTORAGE_KNOWN, JSON.stringify(knownWordsArray.value))
}, { deep: true })

watch(uncertainWordsArray, () => {
    localStorage.setItem(KEY_LOCALSTORAGE_UNCERTAIN, JSON.stringify(uncertainWordsArray.value))
}, { deep: true })

watch(selectedVocabulary, (newValue) => {
    localStorage.setItem(KEY_LOCALSTORAGE_LAST_VOCABULARY, newValue)
})

watch(filterMode, (mode) => {
    localStorage.setItem(KEY_LOCALSTORAGE_FILTER, mode)
})

watch(currentVocabulary, () => {
    nextTick(() => drawPixelMap(true))
})

onMounted(async () => {
    const savedFilter = localStorage.getItem(KEY_LOCALSTORAGE_FILTER)
    if (savedFilter === 'review') filterMode.value = 'review'
    selectedVocabulary.value = resolveVocabularyName(localStorage.getItem(KEY_LOCALSTORAGE_LAST_VOCABULARY))
    await loadVocabulary(selectedVocabulary.value)

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

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onDocumentBlur)
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('scroll', onWindowScroll, { passive: true })

    if (toolbarRef.value) {
        pixelMapObserver = new ResizeObserver(() => {
            if (getHeaderContentHeight() !== pixelMapMaxRows) drawPixelMap(true)
        })
        pixelMapObserver.observe(toolbarRef.value)
    }
    nextTick(() => drawPixelMap(true))
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onDocumentBlur)
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('scroll', onWindowScroll)
    pixelMapObserver?.disconnect()
    pixelMapObserver = null
    window.clearTimeout(toastTimer)
    window.speechSynthesis?.cancel()
})
</script>

<template>
    <header ref="toolbarRef" class="toolbar">
        <a class="brand" target="_blank" href="https://github.com/KyleBing/vocabulary" title="GitHub">
            <img src="./github-mark.png" alt=""/>
        </a>

        <select v-model="selectedVocabulary" @change="handleVocabularyChange" class="form-select form-select-sm vocab-select">
            <optgroup v-for="(group, groupName) in VOCABULARY_IMPORTS" :key="groupName" :label="groupName">
                <option v-for="(_, name) in group" :key="name" :value="name">{{ name }}</option>
            </optgroup>
        </select>

        <div class="pixel-overview" :title="`会了 ${bookStats.known} · 再看 ${bookStats.uncertain} · 共 ${bookStats.total}`">
            <canvas ref="pixelMapRef" class="pixel-map"></canvas>
            <div class="progress-label">{{ bookStats.known }} / {{ bookStats.total }}</div>
        </div>

        <div class="filters">
            <button :class="{ on: filterMode === 'all' }" @click="setFilter('all')">全部</button>
            <button :class="{ on: filterMode === 'review' }" @click="setFilter('review')">
                待复习
                <span class="count">{{ bookStats.uncertain }}</span>
            </button>
        </div>

        <div class="toolbar-actions">
            <button @click="reshuffle">打乱</button>
            <button @click="importConfigFromClipboard">导入</button>
            <button @click="exportConfigToClipboard">导出</button>
        </div>
    </header>

    <div class="word-list">
        <div v-if="!visibleWords.length" class="empty-hint">{{ emptyHint }}</div>
        <div
            v-for="(item, index) in visibleWords"
            :key="item.word + '-' + index"
            :class="[
                'word-item',
                { known: knownWordsSet.has(item.word) },
                { uncertain: uncertainWordsSet.has(item.word) },
                { active: activeItem?.word === item.word },
            ]"
            @click="handleWordClick(item)"
            @contextmenu="handleWordContextMenu(item, $event)"
            @mouseenter="handleWordHover(item.word)"
        >
            <div class="word unselectable">{{ item.word }}</div>
        </div>
    </div>

    <div
        v-if="activeItem"
        ref="panelRef"
        class="detail-panel"
        :style="{ left: panelPos.left + 'px', top: panelPos.top + 'px' }"
        @click.stop
    >
        <div class="detail-head">
            <div class="detail-word">{{ activeItem.word }}</div>
            <button class="speak" type="button" @click="speakWord(activeItem.word)">朗读</button>
        </div>
        <div class="phonetic" v-if="activeItem.us || activeItem.uk">
            <span v-if="activeItem.us">美 /{{ activeItem.us }}/</span>
            <span v-if="activeItem.uk">英 /{{ activeItem.uk }}/</span>
        </div>
        <div class="translation-list" v-if="activeItem.translations?.length">
            <div class="translation-item" v-for="translation in activeItem.translations" :key="translation.type + translation.translation">
                <div class="type">{{ translation.type }}</div>
                <div class="translation">{{ translation.translation }}</div>
            </div>
        </div>
        <div class="sentence-list" v-if="activeSentences.length">
            <div class="sentence-item" v-for="sentence in activeSentences" :key="sentence.sentence">
                <div class="sentence-en">{{ sentence.sentence }}</div>
                <div class="sentence-cn">{{ sentence.translation }}</div>
            </div>
        </div>
        <div class="phrase-list" v-if="activePhrases.length">
            <div class="phrase-item" v-for="phrase in activePhrases" :key="phrase.phrase">
                <span class="phrase">{{ phrase.phrase }}</span>
                <span class="phrase-cn">{{ phrase.translation }}</span>
            </div>
        </div>
        <div class="detail-hint">单击 会了 · /+单击 再看 · Ctrl+单击 取消 · 右键 释义</div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
</template>

<style scoped lang="scss">
@import "vocabulary";
</style>
