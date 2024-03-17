import jsonTexts from '../../data/textMessages.json';
export const getText = (fieldName: string, params?: { name: string; value: string}) => {
    try {
        // @ts-ignore
        const resText: string = jsonTexts[fieldName];
        if (params) {
            resText.replace(`{{${params.name}}}`, params.value)
        }
        return resText;
    } catch {
        return '0'
    }
}

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
export const messageResult = () => getText('messageResult');
export const prohibitedSendingLinks = () => getText('prohibitedSendingLinks');
