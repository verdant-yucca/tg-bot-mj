import { bannedWords } from '../../constants/bannedWords';

export function detectBannedWords(prompt: string): string[] {
    const promptToLowerCase = prompt.toLowerCase();
    const matches: string[] = [];
    bannedWords().forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const wordMatches = promptToLowerCase.match(regex);
        if (wordMatches) {
            wordMatches.forEach(match => {
                matches.push(match);
            });
        }
    });
    return matches;
}

export const checkIsBadPrompt = (prompt: string) => {
    try {
        const detectedBannedWords = detectBannedWords(prompt);
        console.log('detectedBannedWords', detectedBannedWords);

        return detectedBannedWords.length > 0;
    } catch (e) {
        return false;
    }
};
