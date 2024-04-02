//функция экранирует спецсимволы в тексе
export const escapeTelegrafMarkdown = (text: string) => {
    const specialCharacters = ['\\', '_', '*', '[', ']'];
    let escapedText = '';
    for (const char of text) {
        if (specialCharacters.includes(char)) {
            escapedText += '\\' + char;
        } else {
            escapedText += char;
        }
    }
    return escapedText;
};
