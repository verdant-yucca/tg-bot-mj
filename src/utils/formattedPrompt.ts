export const formattedPrompt = (prompt: string) =>
    prompt.replace('--fast', '').replace('—fast', '').replace('--turbo', '').replace('—turbo', '');
