import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

export const logger = (ctx: Context<Update>, next: () => Promise<void>) => {
    const chanel = ctx.update as any;
    if (chanel.channel_post?.chat?.id) return;

    try {
        const date = new Date().toISOString();
        const username = ctx.from?.username || ctx.from?.first_name;

        const msg = ctx.message
            ? // @ts-ignore
            `${date} - chatId: ${ctx.message.from.id}, username: ${username}, msg: ${ctx.message.text}`
            : // @ts-ignore
            `${date} - chatId: ${ctx.update?.callback_query?.from.id}, username: ${username}, callback_query - ${ctx.update?.callback_query?.data}`;

        console.info(msg);
        return next();
    } catch (e) {
        console.log('Catch logger:', e);
        // ctx.reply(e);
    }
};
