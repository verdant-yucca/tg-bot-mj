import { wordsForDelete } from '../constants/wordsfordelete';

export const formattedPrompt = (prompt: string) => {
    const wordsForDeleteConst = wordsForDelete();
    let result = prompt;

    wordsForDeleteConst.forEach(word => {
        result = result.replace(word, '');
    });
    return result;
};
