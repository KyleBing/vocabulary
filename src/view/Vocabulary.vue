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
type FullVocabRaw = {
    headWord?: string
    content?: {
        word?: {
            wordHead?: string
            content?: {
                usphone?: string
                ukphone?: string
                phone?: string
                trans?: Array<{ tranCn?: string; pos?: string }>
                phrase?: { phrases?: Array<{ pContent?: string; pCn?: string }> }
                sentence?: { sentences?: Array<{ sContent?: string; sCn?: string }> }
                realExamSentence?: { sentences?: Array<{ sContent?: string; sCn?: string }> }
            }
        }
    }
}
type FilterMode = 'all' | 'review'
type ThemeMode = 'dark' | 'light'

function isVocabItem(item: unknown): item is VocabItem {
    return !!item && typeof item === 'object' && typeof (item as VocabItem).word === 'string'
}

function normalizeFullItem(raw: FullVocabRaw): VocabItem | null {
    const content = raw.content?.word?.content
    const word = raw.headWord || raw.content?.word?.wordHead
    if (!word || !content) return null

    const translations = (content.trans || [])
        .filter(item => item.tranCn)
        .map(item => ({
            translation: item.tranCn as string,
            type: item.pos || undefined,
        }))

    const phrases = (content.phrase?.phrases || [])
        .filter(item => item.pContent)
        .map(item => ({
            phrase: item.pContent as string,
            translation: item.pCn || '',
        }))

    const normalSentences = (content.sentence?.sentences || [])
        .filter(item => item.sContent)
        .map(item => ({
            sentence: item.sContent as string,
            translation: item.sCn || '',
        }))
    const examSentences = (content.realExamSentence?.sentences || [])
        .filter(item => item.sContent)
        .map(item => ({
            sentence: item.sContent as string,
            translation: item.sCn || '',
        }))
    const sentences = normalSentences.length ? normalSentences : examSentences

    return {
        word,
        us: content.usphone || content.phone || undefined,
        uk: content.ukphone || undefined,
        translations,
        phrases,
        sentences,
    }
}

function normalizeVocabularyList(list: unknown[]): VocabItem[] {
    const result: VocabItem[] = []
    for (const item of list) {
        if (isVocabItem(item)) {
            result.push(item)
            continue
        }
        const normalized = normalizeFullItem(item as FullVocabRaw)
        if (normalized) result.push(normalized)
    }
    return result
}

const VOCABULARY_IMPORTS = {
    '基础词汇': {
        '初中词汇': () => import('../vocabulary/json_original/json-full/ChuZhong_2.json'),
        '高中词汇': () => import('../vocabulary/json_original/json-full/GaoZhong_2.json'),
        '四级词汇': () => import('../vocabulary/json_original/json-full/CET4_2.json'),
        '六级词汇': () => import('../vocabulary/json_original/json-full/CET6_2.json'),
        '考研词汇': () => import('../vocabulary/json_original/json-full/KaoYan_2.json'),
        '托福词汇': () => import('../vocabulary/json_original/json-full/TOEFL_2.json'),
        'SAT词汇': () => import('../vocabulary/json_original/json-full/SAT_2.json'),
    },
    '小学词汇': {
        '人教版小学三年级上册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue3_1.json'),
        '人教版小学三年级下册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue3_2.json'),
        '人教版小学四年级上册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue4_1.json'),
        '人教版小学四年级下册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue4_2.json'),
        '人教版小学五年级上册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue5_1.json'),
        '人教版小学五年级下册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue5_2.json'),
        '人教版小学六年级上册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue6_1.json'),
        '人教版小学六年级下册': () => import('../vocabulary/json_original/json-full/PEPXiaoXue6_2.json'),
    },
    '初中词汇': {
        '人教版初中七年级上册': () => import('../vocabulary/json_original/json-full/PEPChuZhong7_1.json'),
        '人教版初中七年级下册': () => import('../vocabulary/json_original/json-full/PEPChuZhong7_2.json'),
        '人教版初中八年级上册': () => import('../vocabulary/json_original/json-full/PEPChuZhong8_1.json'),
        '人教版初中八年级下册': () => import('../vocabulary/json_original/json-full/PEPChuZhong8_2.json'),
        '人教版初中九年级': () => import('../vocabulary/json_original/json-full/PEPChuZhong9_1.json'),
        '外研社初中一年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_1.json'),
        '外研社初中二年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_2.json'),
        '外研社初中三年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_3.json'),
        '外研社初中四年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_4.json'),
        '外研社初中五年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_5.json'),
        '外研社初中六年级': () => import('../vocabulary/json_original/json-full/WaiYanSheChuZhong_6.json'),
    },
    '高中词汇': {
        '人教版高中必修1': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_1.json'),
        '人教版高中必修2': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_2.json'),
        '人教版高中必修3': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_3.json'),
        '人教版高中必修4': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_4.json'),
        '人教版高中必修5': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_5.json'),
        '人教版高中选修6': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_6.json'),
        '人教版高中选修7': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_7.json'),
        '人教版高中选修8': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_8.json'),
        '人教版高中选修9': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_9.json'),
        '人教版高中选修10': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_10.json'),
        '人教版高中选修11': () => import('../vocabulary/json_original/json-full/PEPGaoZhong_11.json'),
        '北师大版高中必修1': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_1.json'),
        '北师大版高中必修2': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_2.json'),
        '北师大版高中必修3': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_3.json'),
        '北师大版高中必修4': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_4.json'),
        '北师大版高中必修5': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_5.json'),
        '北师大版高中选修6': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_6.json'),
        '北师大版高中选修7': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_7.json'),
        '北师大版高中选修8': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_8.json'),
        '北师大版高中选修9': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_9.json'),
        '北师大版高中选修10': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_10.json'),
        '北师大版高中选修11': () => import('../vocabulary/json_original/json-full/BeiShiGaoZhong_11.json'),
    },
    '大学词汇': {
        '四级真题核心词': () => import('../vocabulary/json_original/json-full/CET4_1.json'),
        '四级英语词汇': () => import('../vocabulary/json_original/json-full/CET4_2.json'),
        '六级真题核心词': () => import('../vocabulary/json_original/json-full/CET6_1.json'),
        '六级英语词汇': () => import('../vocabulary/json_original/json-full/CET6_2.json'),
        '考研必考词汇': () => import('../vocabulary/json_original/json-full/KaoYan_1.json'),
        '考研英语词汇': () => import('../vocabulary/json_original/json-full/KaoYan_2.json'),
    },
    '国际考试': {
        'TOEFL词汇': () => import('../vocabulary/json_original/json-full/TOEFL_2.json'),
        '雅思词汇': () => import('../vocabulary/json_original/json-full/IELTS_2.json'),
        'SAT词汇': () => import('../vocabulary/json_original/json-full/SAT_2.json'),
        'GRE词汇': () => import('../vocabulary/json_original/json-full/GRE_2.json'),
        'GMAT词汇': () => import('../vocabulary/json_original/json-full/GMAT_2.json'),
        '商务英语词汇': () => import('../vocabulary/json_original/json-full/BEC_2.json'),
        '专四核心词汇-1': () => import('../vocabulary/json_original/json-full/Level4_1.json'),
        '专四核心词汇-2': () => import('../vocabulary/json_original/json-full/Level4_2.json'),
        '专八核心词汇-1': () => import('../vocabulary/json_original/json-full/Level8_1.json'),
        '专八核心词汇-2': () => import('../vocabulary/json_original/json-full/Level8_2.json'),
    },
    '新东方': {
        '初中词汇（新东方）': () => import('../vocabulary/json_original/json-full/ChuZhong_3.json'),
        '高中词汇（新东方）': () => import('../vocabulary/json_original/json-full/GaoZhong_3.json'),
        '四级词汇（新东方）': () => import('../vocabulary/json_original/json-full/CET4_3.json'),
        '六级词汇（新东方）': () => import('../vocabulary/json_original/json-full/CET6_3.json'),
        '考研词汇（新东方）': () => import('../vocabulary/json_original/json-full/KaoYan_3.json'),
        'TOEFL词汇（新东方）': () => import('../vocabulary/json_original/json-full/TOEFL_3.json'),
        '雅思词汇（新东方）': () => import('../vocabulary/json_original/json-full/IELTS_3.json'),
        'SAT词汇（新东方）': () => import('../vocabulary/json_original/json-full/SAT_3.json'),
        'GRE词汇（新东方）': () => import('../vocabulary/json_original/json-full/GRE_3.json'),
        'GMAT词汇（新东方）': () => import('../vocabulary/json_original/json-full/GMAT_3.json'),
        'BEC词汇（新东方）': () => import('../vocabulary/json_original/json-full/BEC_3.json'),
    }
}

const KEY_LOCALSTORAGE_KNOWN = "known_words"
const KEY_LOCALSTORAGE_UNCERTAIN = "uncertain_words"
const KEY_LOCALSTORAGE_LAST_VOCABULARY = "last_vocabulary"
const KEY_LOCALSTORAGE_FILTER = "vocabulary_filter"
const KEY_LOCALSTORAGE_THEME = "vocabulary_theme"
const KEY_LOCALSTORAGE_SOUND_MUTED = "vocabulary_sound_muted"
const KEY_LOCALSTORAGE_SPEAK_HOVER = "vocabulary_speak_hover"
const KEY_LOCALSTORAGE_SPEAK_DETAIL = "vocabulary_speak_detail"
const DEFAULT_VOCABULARY = "初中词汇"

type SpeakSource = 'hover' | 'detail' | 'manual' | 'click'

function readStoredTheme(): ThemeMode {
    return localStorage.getItem(KEY_LOCALSTORAGE_THEME) === 'light' ? 'light' : 'dark'
}

function applyTheme(mode: ThemeMode) {
    document.documentElement.setAttribute('data-theme', mode)
}

function readSpeakFlag(key: string, fallback: boolean) {
    const value = localStorage.getItem(key)
    if (value === '1') return true
    if (value === '0') return false
    return fallback
}

function readInitialSpeakSettings() {
    const legacyMuted = localStorage.getItem(KEY_LOCALSTORAGE_SOUND_MUTED) === '1'
    const fallback = !legacyMuted
    return {
        hover: readSpeakFlag(KEY_LOCALSTORAGE_SPEAK_HOVER, fallback),
        detail: readSpeakFlag(KEY_LOCALSTORAGE_SPEAK_DETAIL, fallback),
    }
}

const knownWordsSet = ref(new Set<string>())
const knownWordsArray = ref<Array<string>>([])
const uncertainWordsSet = ref(new Set<string>())
const uncertainWordsArray = ref<Array<string>>([])

const currentVocabulary = ref<VocabItem[]>([])
const shuffledWords = ref<VocabItem[]>([])
const loading = ref(true)
const selectedVocabulary = ref(DEFAULT_VOCABULARY)
const filterMode = ref<FilterMode>('all')
const searchQuery = ref('')
const theme = ref<ThemeMode>(readStoredTheme())
applyTheme(theme.value)
const initialSpeak = readInitialSpeakSettings()
const speakOnHover = ref(initialSpeak.hover)
const speakOnDetail = ref(initialSpeak.detail)
const soundMenuOpen = ref(false)
const soundMenuPos = ref({ top: 0, right: 0 })
const soundToggleRef = ref<HTMLElement | null>(null)
const soundAllOff = computed(() => !speakOnHover.value && !speakOnDetail.value)

const activeItem = ref<VocabItem | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelPos = ref({ left: 16, top: 72 })
const panelAbove = ref(false)
const toolbarRef = ref<HTMLElement | null>(null)
const pixelMapRef = ref<HTMLCanvasElement | null>(null)
const toast = ref('')
const speakingWord = ref('')
const helpOpen = ref(false)
let toastTimer = 0
let speakTimer = 0
let panelCloseTimer = 0
let lastSpokenWord = ''
let pixelMapObserver: ResizeObserver | null = null
const PANEL_CLOSE_DELAY_MS = 200
let pixelMapCols = 0
let pixelMapRows = 0
let pixelMapMaxRows = 0
const wordIndexMap = new Map<string, number>()
const SPEAKER_PATH = 'M525.541411 131.503033l-230.494605 148.031475h-114.988917c-63.895239 0-115.679649 51.14996-115.679649 115.219161v230.898811c0 63.664995 51.150984 115.219161 115.679649 115.219161h114.988917l230.494605 147.915841c32.582069 14.128789 57.840336-0.980327 57.840336-33.04358V164.54559c0-32.120558-25.892717-46.825468-57.840336-33.042557z m194.223516 186.033997c-10.841929-11.649318-29.122271-12.283768-40.712237-1.384533-11.649318 10.899234-12.226462 29.122271-1.384533 40.770565 5.363148 5.76633 14.531971 18.511609 23.989367 37.772279 16.146749 32.870642 25.892717 71.449285 25.892717 115.507733 0 44.058448-9.745968 82.694397-25.892717 115.507734-9.457396 19.259646-18.626219 32.004925-23.989367 37.772278-10.899234 11.648294-10.264784 29.871331 1.384533 40.770566 11.648294 10.899234 29.871331 10.264784 40.770566-1.384533 9.054213-9.68764 21.509896-26.987654 33.620725-51.727105 19.895119-40.483017 31.774681-87.654362 31.774681-140.996245 0-53.341882-11.879562-100.514251-31.774681-140.996244-12.169157-24.62484-24.625864-41.983183-33.679054-51.612495z m176.806845-35.69599c-23.297612-39.444361-46.825468-66.778916-63.318094-81.483826-11.880585-10.609639-30.102598-9.572006-40.714284 2.36486-10.609639 11.936867-9.573029 30.101575 2.364861 40.712238 2.709715 2.421142 8.131191 7.842619 15.396665 16.261358 12.455683 14.416338 24.911366 31.601742 36.619012 51.439556 33.504068 56.860009 53.630455 123.349329 53.630455 199.066825s-20.126386 142.206816-53.68776 199.125153c-11.706623 19.836791-24.220634 37.022195-36.619012 51.438533-7.265474 8.41874-12.68695 13.840216-15.397689 16.261359-11.879562 10.610662-12.916171 28.833699-2.363837 40.714283 10.553357 11.879562 28.833699 12.916171 40.713261 2.363838 16.493649-14.70491 40.021505-41.98216 63.319117-81.483826 38.522362-65.336054 61.646012-141.745305 61.646012-228.41934 0.058328-86.614683-23.066345-163.023934-61.588707-228.361011z'

const PIXEL_KNOWN = '#4CD964'
const PIXEL_UNCERTAIN = '#FF9500'
const PIXEL_SIZE = 1

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
    let list = shuffledWords.value
    if (filterMode.value === 'review') {
        list = list.filter(item => uncertainWordsSet.value.has(item.word))
    }
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return list
    return list.filter(item => {
        if (item.word.toLowerCase().includes(query)) return true
        return (item.translations || []).some(entry =>
            entry.translation.toLowerCase().includes(query)
        )
    })
})

const activePhrases = ref<Phrase[]>([])
const activeSentence = ref<Sentence | null>(null)
const activeStatus = computed(() => {
    const word = activeItem.value?.word
    if (!word) return 'new'
    if (knownWordsSet.value.has(word)) return 'known'
    if (uncertainWordsSet.value.has(word)) return 'uncertain'
    return 'new'
})

const emptyHint = computed(() => {
    if (loading.value) return '词库加载中…'
    if (!currentVocabulary.value.length) return '没有找到这本词库'
    if (searchQuery.value.trim()) return '没有匹配的词条'
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

const HOVER_SPEAK_DELAY_MS = 480

function clearSpeakingWord(word?: string) {
    if (!word || speakingWord.value === word) speakingWord.value = ''
    if (!word || lastSpokenWord === word) lastSpokenWord = ''
}

function canSpeak(source: SpeakSource) {
    if (source === 'hover') return speakOnHover.value
    if (source === 'detail') return speakOnDetail.value
    return true
}

function speakWord(text: string, options: { immediate?: boolean; source?: SpeakSource } = {}) {
    const { immediate = false, source = 'manual' } = options
    if (!text || !('speechSynthesis' in window)) return
    if (!canSpeak(source)) return
    window.clearTimeout(speakTimer)
    const play = () => {
        if (!canSpeak(source)) return
        const synth = window.speechSynthesis
        // Chrome can get stuck in paused state after rapid cancel/speak.
        if (synth.paused) synth.resume()
        if (synth.speaking || synth.pending) synth.cancel()
        speakTimer = window.setTimeout(() => {
            if (!canSpeak(source)) return
            if (synth.paused) synth.resume()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'en-US'
            utterance.rate = 0.92
            utterance.volume = 0.8
            utterance.onstart = () => {
                speakingWord.value = text
                lastSpokenWord = text
            }
            utterance.onend = () => clearSpeakingWord(text)
            utterance.onerror = () => clearSpeakingWord(text)
            speakingWord.value = text
            lastSpokenWord = text
            synth.speak(utterance)
        }, 40)
    }
    if (immediate) {
        play()
        return
    }
    // Only speak after the pointer stays on the target for a while.
    if (text === lastSpokenWord && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) return
    speakTimer = window.setTimeout(play, HOVER_SPEAK_DELAY_MS)
}

function cancelHoverSpeak() {
    window.clearTimeout(speakTimer)
}

function persistSpeakSettings() {
    localStorage.setItem(KEY_LOCALSTORAGE_SPEAK_HOVER, speakOnHover.value ? '1' : '0')
    localStorage.setItem(KEY_LOCALSTORAGE_SPEAK_DETAIL, speakOnDetail.value ? '1' : '0')
}

function placeSoundMenu() {
    const btn = soundToggleRef.value
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    soundMenuPos.value = {
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
    }
}

function toggleSoundMenu() {
    soundMenuOpen.value = !soundMenuOpen.value
    if (soundMenuOpen.value) {
        helpOpen.value = false
        activeItem.value = null
        placeSoundMenu()
    }
}

function closeSoundMenu() {
    soundMenuOpen.value = false
}

function setSpeakOnHover(enabled: boolean) {
    speakOnHover.value = enabled
    persistSpeakSettings()
    if (!enabled) cancelHoverSpeak()
}

function setSpeakOnDetail(enabled: boolean) {
    speakOnDetail.value = enabled
    persistSpeakSettings()
}

function openHelp() {
    activeItem.value = null
    soundMenuOpen.value = false
    helpOpen.value = true
}

function closeHelp() {
    helpOpen.value = false
}

async function loadVocabulary(name: string) {
    loading.value = true
    activeItem.value = null
    searchQuery.value = ''
    for (const group of Object.values(VOCABULARY_IMPORTS)) {
        if (name in group) {
            const module = await group[name]()
            const list = normalizeVocabularyList(module.default as unknown[])
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

function pixelNewColor() {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--pixel-new').trim()
    return value || 'rgba(255,255,255,0.16)'
}

function pixelColorFor(word: string) {
    if (knownWordsSet.value.has(word)) return PIXEL_KNOWN
    if (uncertainWordsSet.value.has(word)) return PIXEL_UNCERTAIN
    return pixelNewColor()
}

function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(KEY_LOCALSTORAGE_THEME, theme.value)
    applyTheme(theme.value)
    nextTick(repaintPixelMapColors)
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
    ctx.fillRect(
        (index % pixelMapCols) * PIXEL_SIZE,
        Math.floor(index / pixelMapCols) * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
    )
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
        ctx.fillRect(
            (i % pixelMapCols) * PIXEL_SIZE,
            Math.floor(i / pixelMapCols) * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE,
        )
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
    // Height locked to header controls; each word is PIXEL_SIZE×PIXEL_SIZE.
    const maxWordRows = Math.max(1, Math.floor(maxRows / PIXEL_SIZE))
    const cols = Math.max(1, Math.ceil(total / maxWordRows))
    const rows = Math.ceil(total / cols)
    if (!force && cols === pixelMapCols && rows === pixelMapRows && maxRows === pixelMapMaxRows && wordIndexMap.size === total) {
        return
    }
    pixelMapCols = cols
    pixelMapRows = rows
    pixelMapMaxRows = maxRows
    rebuildWordIndexMap()
    const cssW = cols * PIXEL_SIZE
    const cssH = rows * PIXEL_SIZE
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)
    for (let i = 0; i < total; i++) {
        ctx.fillStyle = pixelColorFor(words[i].word)
        ctx.fillRect(
            (i % cols) * PIXEL_SIZE,
            Math.floor(i / cols) * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE,
        )
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

function pickRandomItems<T>(list: T[], count: number) {
    if (list.length <= count) return list.slice()
    const pool = list.slice()
    const picked: T[] = []
    while (picked.length < count && pool.length) {
        const index = Math.floor(Math.random() * pool.length)
        picked.push(pool.splice(index, 1)[0])
    }
    return picked
}

function pickActiveExtras(item: VocabItem | null) {
    const phrases = (item?.phrases || []).filter(entry => entry.phrase)
    const sentences = (item?.sentences || []).filter(entry => entry.sentence)
    activePhrases.value = pickRandomItems(phrases, 2)
    activeSentence.value = pickRandomItems(sentences, 1)[0] || null
}

function closePanel() {
    cancelPanelClose()
    activeItem.value = null
    activePhrases.value = []
    activeSentence.value = null
    panelAbove.value = false
}

let markFeedbackTimer = 0

function finishMarkWithFeedback(message: string) {
    showToast(message)
    cancelPanelClose()
    window.clearTimeout(markFeedbackTimer)
    markFeedbackTimer = window.setTimeout(() => {
        markFeedbackTimer = 0
        closePanel()
    }, 220)
}

function markKnown(word: string) {
    deleteUncertainWord(word)
    if (!knownWordsSet.value.has(word)) addKnownWord(word)
    finishMarkWithFeedback('已标记为会')
}

function markUnknown(word: string) {
    deleteKnownWord(word)
    deleteUncertainWord(word)
    finishMarkWithFeedback('已标记为不会')
}

function markUncertain(word: string) {
    deleteKnownWord(word)
    if (!uncertainWordsSet.value.has(word)) addUncertainWord(word)
    finishMarkWithFeedback('已标记为待复习')
}

async function placePanel(anchor: HTMLElement) {
    panelAbove.value = false
    await nextTick()
    const panel = panelRef.value
    const rect = anchor.getBoundingClientRect()
    const margin = 10
    const width = panel?.offsetWidth || 340
    let height = panel?.offsetHeight || 280
    let left = rect.left
    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin
    if (left < margin) left = margin
    // Keep flush with the word so the pointer can move into the panel without a gap.
    let top = rect.bottom
    let above = false
    if (top + height > window.innerHeight - margin) {
        const aboveTop = rect.top - height
        if (aboveTop >= margin) {
            top = aboveTop
            above = true
        } else {
            top = Math.max(margin, window.innerHeight - height - margin)
            above = top + height / 2 < rect.top + rect.height / 2
        }
    }
    if (above !== panelAbove.value) {
        panelAbove.value = above
        await nextTick()
        height = panel?.offsetHeight || height
        if (above) {
            top = rect.top - height
            if (top < margin) top = margin
        } else {
            top = rect.bottom
            if (top + height > window.innerHeight - margin) {
                top = Math.max(margin, window.innerHeight - height - margin)
            }
        }
    }
    panelPos.value = { left, top }
}

function cancelPanelClose() {
    window.clearTimeout(panelCloseTimer)
    panelCloseTimer = 0
}

function schedulePanelClose() {
    cancelPanelClose()
    panelCloseTimer = window.setTimeout(() => {
        activeItem.value = null
        panelCloseTimer = 0
    }, PANEL_CLOSE_DELAY_MS)
}

function handlePanelEnter() {
    cancelPanelClose()
}

function handleWordHover(word: string) {
    if (activeItem.value && activeItem.value.word !== word) {
        schedulePanelClose()
    } else {
        cancelPanelClose()
    }
    speakWord(word, { source: 'hover' })
}

function handleWordClick(item: VocabItem) {
    speakWord(item.word, { immediate: true, source: 'click' })
    if (activeItem.value && activeItem.value.word !== item.word) {
        activeItem.value = null
    }
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
    cancelPanelClose()
    activeItem.value = item
    pickActiveExtras(item)
    placePanel(event.currentTarget as HTMLElement)
    speakWord(item.word, { immediate: true, source: 'detail' })
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

function isTypingInField(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null
    if (!target) return false
    const tag = target.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

function clearSearch() {
    searchQuery.value = ''
}

function onKeyDown(event: KeyboardEvent) {
    const typing = isTypingInField(event)
    if (!typing) {
        if (event.key === 'Control' || event.key === 'Meta') {
            isCtrlPressed.value = true
        }
        if (event.key === '/' || event.keyCode === 191) {
            isSlashPressed.value = true
        }
    }
    if (event.key === 'Escape') {
        if (helpOpen.value) {
            closeHelp()
            return
        }
        if (soundMenuOpen.value) {
            closeSoundMenu()
            return
        }
        if (searchQuery.value) {
            clearSearch()
            ;(event.target as HTMLElement | null)?.blur?.()
            return
        }
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
    if (soundMenuOpen.value && !target.closest('.sound-menu-wrap') && !target.closest('.sound-menu')) {
        closeSoundMenu()
    }
    if (helpOpen.value) {
        if (!target.closest('.help-dialog') && !target.closest('.help-trigger')) {
            closeHelp()
        }
        return
    }
    if (!target.closest('.word-item') && !target.closest('.detail-panel')) {
        activeItem.value = null
    }
}

function onWindowScroll() {
    if (activeItem.value) activeItem.value = null
    if (soundMenuOpen.value) placeSoundMenu()
}

const CONFIG_PACK_PREFIX = 'VB2.'

function normalizeWordList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((word): word is string => typeof word === 'string' && word.length > 0)
    }
    if (typeof value === 'string') {
        return value.split(/\n+/).map(word => word.trim()).filter(Boolean)
    }
    return []
}

function bytesToBase64Url(bytes: Uint8Array) {
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(base64url: string) {
    const normalized = base64url.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/g, '')
    const padded = normalized + '==='.slice((normalized.length + 3) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

async function compressBytes(bytes: Uint8Array) {
    if (typeof CompressionStream === 'undefined') return null
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function decompressBytes(bytes: Uint8Array) {
    if (typeof DecompressionStream === 'undefined') throw new Error('no decompress')
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function packConfigForExport() {
    const known = Array.from(new Set(knownWordsArray.value))
    const uncertain = Array.from(new Set(uncertainWordsArray.value))
    const lastVocabulary = selectedVocabulary.value
    const json = JSON.stringify({
        known: known.join('\n'),
        uncertain: uncertain.join('\n'),
        lastVocabulary,
    })
    const raw = new TextEncoder().encode([lastVocabulary, known.join('\n'), uncertain.join('\n')].join('\0'))
    const compressed = await compressBytes(raw)
    if (!compressed) return json
    return CONFIG_PACK_PREFIX + bytesToBase64Url(compressed)
}

async function unpackConfigText(text: string): Promise<{ known: string[]; uncertain: string[]; lastVocabulary?: string }> {
    const trimmed = text.trim()
    if (trimmed.startsWith(CONFIG_PACK_PREFIX)) {
        const bytes = await decompressBytes(base64UrlToBytes(trimmed.slice(CONFIG_PACK_PREFIX.length)))
        const raw = new TextDecoder().decode(bytes)
        const [lastVocabulary = '', knownText = '', uncertainText = ''] = raw.split('\0')
        return {
            known: normalizeWordList(knownText),
            uncertain: normalizeWordList(uncertainText),
            lastVocabulary: lastVocabulary || undefined,
        }
    }
    const config = JSON.parse(trimmed)
    if (!('known' in config) || !('uncertain' in config)) throw new Error('bad format')
    return {
        known: normalizeWordList(config.known),
        uncertain: normalizeWordList(config.uncertain),
        lastVocabulary: typeof config.lastVocabulary === 'string' ? config.lastVocabulary : undefined,
    }
}

async function applyImportedConfig(knownRaw: string[], uncertainRaw: string[], lastVocabulary?: string) {
    const known = Array.from(new Set(knownRaw))
    const knownSet = new Set(known)
    const uncertain = Array.from(new Set(uncertainRaw)).filter(word => !knownSet.has(word))
    knownWordsArray.value = known
    knownWordsSet.value = knownSet
    uncertainWordsArray.value = uncertain
    uncertainWordsSet.value = new Set(uncertain)
    if (lastVocabulary) {
        selectedVocabulary.value = resolveVocabularyName(lastVocabulary)
        await loadVocabulary(selectedVocabulary.value)
    } else {
        repaintPixelMapColors()
    }
}

async function exportConfigToClipboard() {
    try {
        const packed = await packConfigForExport()
        const write = navigator.clipboard?.writeText(packed)
        if (write) {
            await write
            showToast('配置已复制')
            return
        }
        copyWithClipboard(packed)
    } catch {
        showToast('导出失败')
    }
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
        const config = await unpackConfigText(text)
        await applyImportedConfig(config.known, config.uncertain, config.lastVocabulary)
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
    window.clearTimeout(speakTimer)
    window.clearTimeout(markFeedbackTimer)
    cancelPanelClose()
    speakingWord.value = ''
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

        <div class="pixel-overview" :title="`本册会了 ${bookStats.known} · 再看 ${bookStats.uncertain} · 共 ${bookStats.total}`">
            <canvas ref="pixelMapRef" class="pixel-map"></canvas>
            <div class="stat book-progress" title="本册进度">
                <span class="stat-num">{{ bookStats.known }}</span>
                <span class="stat-sep">/</span>
                <span class="stat-num">{{ bookStats.total }}</span>
            </div>
        </div>

        <div class="filters">
            <button :class="{ on: filterMode === 'all' }" @click="setFilter('all')">
                全部
                <span class="count">{{ bookStats.total }}</span>
            </button>
            <button class="review-filter" :class="{ on: filterMode === 'review' }" @click="setFilter('review')">
                待复习
                <span class="count">{{ bookStats.uncertain }}</span>
            </button>
        </div>

        <div class="search-wrap">
            <input
                v-model="searchQuery"
                class="search-input"
                type="search"
                placeholder="筛选词条"
                autocomplete="off"
                spellcheck="false"
                aria-label="筛选词条"
            />
            <button
                v-if="searchQuery"
                class="search-clear"
                type="button"
                title="清除"
                aria-label="清除搜索"
                @click="clearSearch"
            >×</button>
        </div>

        <div class="stat known-total" title="累计已会词条">
            <span class="stat-label">已会</span>
            <span class="stat-num">{{ knownWordsArray.length }}</span>
        </div>

        <div class="toolbar-actions">
            <div class="sound-menu-wrap">
                <button
                    ref="soundToggleRef"
                    class="sound-toggle"
                    type="button"
                    :class="{ muted: soundAllOff, open: soundMenuOpen }"
                    title="发音设置"
                    aria-label="发音设置"
                    :aria-expanded="soundMenuOpen"
                    @click.stop="toggleSoundMenu"
                >
                    <svg class="sound-toggle-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M525.541411 131.503033l-230.494605 148.031475h-114.988917c-63.895239 0-115.679649 51.14996-115.679649 115.219161v230.898811c0 63.664995 51.150984 115.219161 115.679649 115.219161h114.988917l230.494605 147.915841c32.582069 14.128789 57.840336-0.980327 57.840336-33.04358V164.54559c0-32.120558-25.892717-46.825468-57.840336-33.042557z m194.223516 186.033997c-10.841929-11.649318-29.122271-12.283768-40.712237-1.384533-11.649318 10.899234-12.226462 29.122271-1.384533 40.770565 5.363148 5.76633 14.531971 18.511609 23.989367 37.772279 16.146749 32.870642 25.892717 71.449285 25.892717 115.507733 0 44.058448-9.745968 82.694397-25.892717 115.507734-9.457396 19.259646-18.626219 32.004925-23.989367 37.772278-10.899234 11.648294-10.264784 29.871331 1.384533 40.770566 11.648294 10.899234 29.871331 10.264784 40.770566-1.384533 9.054213-9.68764 21.509896-26.987654 33.620725-51.727105 19.895119-40.483017 31.774681-87.654362 31.774681-140.996245 0-53.341882-11.879562-100.514251-31.774681-140.996244-12.169157-24.62484-24.625864-41.983183-33.679054-51.612495z m176.806845-35.69599c-23.297612-39.444361-46.825468-66.778916-63.318094-81.483826-11.880585-10.609639-30.102598-9.572006-40.714284 2.36486-10.609639 11.936867-9.573029 30.101575 2.364861 40.712238 2.709715 2.421142 8.131191 7.842619 15.396665 16.261358 12.455683 14.416338 24.911366 31.601742 36.619012 51.439556 33.504068 56.860009 53.630455 123.349329 53.630455 199.066825s-20.126386 142.206816-53.68776 199.125153c-11.706623 19.836791-24.220634 37.022195-36.619012 51.438533-7.265474 8.41874-12.68695 13.840216-15.397689 16.261359-11.879562 10.610662-12.916171 28.833699-2.363837 40.714283 10.553357 11.879562 28.833699 12.916171 40.713261 2.363838 16.493649-14.70491 40.021505-41.98216 63.319117-81.483826 38.522362-65.336054 61.646012-141.745305 61.646012-228.41934 0.058328-86.614683-23.066345-163.023934-61.588707-228.361011z"/>
                        <line
                            v-if="soundAllOff"
                            class="sound-mute-slash"
                            x1="200"
                            y1="824"
                            x2="824"
                            y2="200"
                        />
                    </svg>
                </button>
            </div>
            <button @click="toggleTheme">{{ theme === 'dark' ? '亮色' : '暗色' }}</button>
            <button @click="reshuffle">打乱</button>
            <button @click="importConfigFromClipboard">导入</button>
            <button @click="exportConfigToClipboard">导出</button>
            <button class="help-trigger" type="button" @click="openHelp">帮助</button>
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
                { speaking: speakingWord === item.word },
            ]"
            @click="handleWordClick(item)"
            @contextmenu="handleWordContextMenu(item, $event)"
            @mouseenter="handleWordHover(item.word)"
            @mouseleave="cancelHoverSpeak"
        >
            <div class="word unselectable">{{ item.word }}</div>
            <svg
                v-if="speakingWord === item.word"
                class="speak-icon"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path :d="SPEAKER_PATH"/>
            </svg>
        </div>
    </div>

    <div
        v-if="activeItem"
        ref="panelRef"
        class="detail-panel"
        :class="{ above: panelAbove }"
        :style="{ left: panelPos.left + 'px', top: panelPos.top + 'px' }"
        @click.stop
        @mouseenter="handlePanelEnter"
    >
        <div v-if="!panelAbove" class="detail-section detail-actions-bar">
            <div class="detail-head-actions">
                <button type="button" :class="['action', 'known', { on: activeStatus === 'known' }]" @click="markKnown(activeItem.word)">会</button>
                <button type="button" :class="['action', 'unknown', { on: activeStatus === 'new' }]" @click="markUnknown(activeItem.word)">不会</button>
                <button type="button" :class="['action', 'review', { on: activeStatus === 'uncertain' }]" @click="markUncertain(activeItem.word)">待复习</button>
                <button
                    class="speak"
                    type="button"
                    :class="{ on: speakingWord === activeItem.word }"
                    title="点击发音"
                    aria-label="朗读词条"
                    @click="speakWord(activeItem.word, { immediate: true, source: 'manual' })"
                >
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path :d="SPEAKER_PATH"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="detail-section">
            <div class="detail-head">
                <div class="detail-word">{{ activeItem.word }}</div>
            </div>
            <div class="phonetic" v-if="activeItem.us || activeItem.uk">
                <span v-if="activeItem.us">美 /{{ activeItem.us }}/</span>
                <span v-if="activeItem.uk">英 /{{ activeItem.uk }}/</span>
            </div>
        </div>
        <div class="detail-section" v-if="activeItem.translations?.length">
            <div class="translation-item" v-for="translation in activeItem.translations" :key="translation.type + translation.translation">
                <div class="type">{{ translation.type }}</div>
                <div class="translation">{{ translation.translation }}</div>
            </div>
        </div>
        <div class="detail-section" v-if="activeSentence">
            <div class="sentence-item">
                <div class="sentence-row">
                    <div class="sentence-en">{{ activeSentence.sentence }}</div>
                    <button
                        class="sentence-speak"
                        type="button"
                        :class="{ on: speakingWord === activeSentence.sentence }"
                        title="点击发音"
                        aria-label="朗读例句"
                        @click.stop="speakWord(activeSentence.sentence, { immediate: true, source: 'manual' })"
                    >
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path :d="SPEAKER_PATH"/>
                        </svg>
                    </button>
                </div>
                <div class="sentence-cn">{{ activeSentence.translation }}</div>
            </div>
        </div>
        <div class="detail-section" v-if="activePhrases.length">
            <div class="phrase-item" v-for="phrase in activePhrases" :key="phrase.phrase">
                <span class="phrase">{{ phrase.phrase }}</span>
                <span class="phrase-cn">{{ phrase.translation }}</span>
            </div>
        </div>
        <div v-if="panelAbove" class="detail-section detail-actions-bar">
            <div class="detail-head-actions">
                <button type="button" :class="['action', 'known', { on: activeStatus === 'known' }]" @click="markKnown(activeItem.word)">会</button>
                <button type="button" :class="['action', 'unknown', { on: activeStatus === 'new' }]" @click="markUnknown(activeItem.word)">不会</button>
                <button type="button" :class="['action', 'review', { on: activeStatus === 'uncertain' }]" @click="markUncertain(activeItem.word)">待复习</button>
                <button
                    class="speak"
                    type="button"
                    :class="{ on: speakingWord === activeItem.word }"
                    title="点击发音"
                    aria-label="朗读词条"
                    @click="speakWord(activeItem.word, { immediate: true, source: 'manual' })"
                >
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path :d="SPEAKER_PATH"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div v-if="helpOpen" class="help-overlay" @click.self="closeHelp">
        <div class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" @click.stop>
            <div class="help-head">
                <h2 id="help-title">使用说明</h2>
                <button class="help-close" type="button" @click="closeHelp">关闭</button>
            </div>
            <ul class="help-list">
                <li><kbd>单击</kbd> 标记为会了</li>
                <li><kbd>/</kbd> + 单击 标记为待复习</li>
                <li><kbd>Ctrl</kbd> + 单击 取消标记</li>
                <li><kbd>右击</kbd> 查看释义</li>
                <li>顶部喇叭可分别开关：悬停发音、查看释义发音</li>
                <li>释义与例句旁喇叭点击发音，始终可用</li>
            </ul>
        </div>
    </div>

    <Teleport to="body">
        <div
            v-if="soundMenuOpen"
            class="sound-menu"
            role="menu"
            :style="{ top: soundMenuPos.top + 'px', right: soundMenuPos.right + 'px' }"
            @click.stop
        >
            <button
                type="button"
                class="sound-option"
                :class="{ enabled: speakOnHover }"
                role="menuitemcheckbox"
                :aria-checked="speakOnHover"
                @click="setSpeakOnHover(!speakOnHover)"
            >
                <span class="sound-option-title">悬停发音</span>
                <span class="sound-switch" aria-hidden="true"><span class="sound-switch-knob"/></span>
            </button>
            <button
                type="button"
                class="sound-option"
                :class="{ enabled: speakOnDetail }"
                role="menuitemcheckbox"
                :aria-checked="speakOnDetail"
                @click="setSpeakOnDetail(!speakOnDetail)"
            >
                <span class="sound-option-title">查看释义发音</span>
                <span class="sound-switch" aria-hidden="true"><span class="sound-switch-knob"/></span>
            </button>
        </div>
    </Teleport>

    <div v-if="toast" class="toast">{{ toast }}</div>
</template>

<style scoped lang="scss">
@import "vocabulary";
</style>
