const jsonPath = '../../data/bannedWords.json';
import jsonTexts from '../../data/bannedWords.json';

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

export const bannedWords = () => getValue('bannedWords');
