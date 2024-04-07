const jsonPath = '../../data/Wordsfordelete.json';
import jsonTexts from '../../data/Wordsfordelete.json';

let json = jsonTexts;

export const reloadJson = () => {
    delete require.cache[require.resolve(jsonPath)];
    json = require(jsonPath);
    console.log(json);
};

export const getValue = (fieldName: string) => {
    try {
        // @ts-ignore
        const resText: string[] = json[fieldName];
        return resText === undefined ? [] : resText;
    } catch {
        return [];
    }
};

export const wordsForDelete = () => getValue('words');
