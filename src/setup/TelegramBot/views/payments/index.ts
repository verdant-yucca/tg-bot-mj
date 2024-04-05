import { Scenes } from 'telegraf';
import { getInvoicePayments } from '../../../../utils/getInvoicePayment';

export const paymentsScene = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>, packageNumber: number) => {
    try {
        const chatId = ctx.from?.id || -1;
        const currentPackage = (await getInvoicePayments(chatId))[packageNumber];
        console.log('currentPackage', currentPackage);
        ctx.replyWithInvoice(currentPackage);
    } catch (e) {
        console.error('package1 -> catch', e);
    }
};
