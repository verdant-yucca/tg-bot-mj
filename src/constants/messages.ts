const jsonPath = '../../data/textMessages.json';
import jsonTexts from '../../data/textMessages.json';

let json = jsonTexts;

export const reloadJson = () => {
    delete require.cache[require.resolve(jsonPath)];
    json = require(jsonPath);
    console.log(json);
};

export const getText = (fieldName: string, params?: { name: string; value: string }) => {
    try {
        // @ts-ignore
        let resText: string = json[fieldName];
        if (params) {
            resText = resText.replace(`{{${params.name}}}`, params.value);
        }
        return resText === undefined ? 'empty value' : resText;
    } catch {
        return 'empty value';
    }
};

export const greetingsMsg = (name: string) => getText('greetingsMsg', { name: 'name', value: name });
export const somethingWentWrong = () => getText('somethingWentWrong');
export const hssOutstandingRequest = () => getText('hasOutstandingRequest');
export const hssCompletedRequest = () => getText('hasCompletedRequest');
export const badRequest = () => getText('badRequest');
export const inNotGroupMember = () => getText('inNotGroupMember');
export const messageEnterYourTextForGenerateImage = () => getText('messageEnterYourTextForGenerateImage');
export const messageEnterYourTextForStylingAvatar = () => getText('messageEnterYourTextForStylingAvatar');
export const messageNoAvatarInProfile = () => getText('messageNoAvatarInProfile');
export const messageEnterImageForStylingImage = () => getText('messageEnterImageForStylingImage');
export const messageEnterTextForStylingImage = () => getText('messageEnterTextForStylingImage');
export const messageEnterFirstImageForBlend = () => getText('messageEnterFirstImageForBlend');
export const messageEnterSecondImageForBlend = () => getText('messageEnterSecondImageForBlend');
export const messageResult = (prompt: string) => {
    const regex = /(https?:\/\/\S+)/g;
    const matches = prompt.match(regex);

    if (!matches || matches.length === 0) {
        return getText('messageResultOnlyText', { value: prompt, name: 'prompt' });
    } else if (matches.length === 1) {
        return getText('messageResultOneImage', { value: prompt.replace(/https?:\/\/\S+/gi, ''), name: 'prompt' });
    } else if (matches.length === 2) {
        return getText('messageResultTwoImage');
    } else {
        // Handle case with more than two links if needed
        return getText('messageResult', { value: prompt, name: 'prompt' });
    }
};
export const prohibitedSendingLinks = () => getText('prohibitedSendingLinks');
export const helpMessage = () => getText('helpMessage');
export const waitMessage = () => getText('waitMessage');
export const waitMessageWithProgress = (progress: string) => getText('waitMessageWithProgress', {
    name: 'progress',
    value: progress
});
export const waitMessageDownloadPhoto = () => getText('waitMessageDownloadPhoto');
export const textButton1 = () => getText('textButton1');
export const textButton2 = () => getText('textButton2');
export const textButton3 = () => getText('textButton3');
export const textButton4 = () => getText('textButton4');
export const textButton5 = () => getText('textButton5');
export const ReplayToGroup = () => getText('replayToGroup');
export const needCheckIsGroupMember = () => getText('needCheckIsGroupMember');
export const textButtonAlreadySubscribed = () => getText('textButtonAlreadySubscribed');
