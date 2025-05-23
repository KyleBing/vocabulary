interface Word {
    word: string, // abruptly,
    translations:Array<{
        translation: string, // 突然地,
        type: string, // adv
    }>
}

/**
 * 表示一个包含发音、翻译、相关短语和例句的单词
 */
interface WordWithSentence {
    /** 单词本身 */
    word: string;
    /** 美式发音（国际音标） */
    us: string;
    /** 英式发音（国际音标） */
    uk: string;
    /** 包含词性的翻译数组 */
    translations: Array<{
        /** 翻译含义 */
        translation: string;
        /** 词性（例如：'n'表示名词，'v'表示动词等） */
        type: string;
    }>;
    /** 相关短语及其翻译 */
    phrases: Array<{
        /** 相关短语 */
        phrase: string;
        /** 短语翻译 */
        translation: string;
    }>;
    /** 使用该单词的例句 */
    sentences: Array<{
        /** 例句 */
        sentence: string;
        /** 句子翻译 */
        translation: string;
    }>;
}

export {
    type Word,
    type WordWithSentence
}
