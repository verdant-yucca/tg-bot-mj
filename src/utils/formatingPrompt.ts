export const formatingPrompt = (prompt: string) => {
    let updatedPrompt = prompt;
    updatedPrompt = updatedPrompt.toLowerCase();
    updatedPrompt = updatedPrompt.replace('style', '');
    updatedPrompt = updatedPrompt.replace('--', '');
    return updatedPrompt;
};
