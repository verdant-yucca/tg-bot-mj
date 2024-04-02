import { getUniqId } from './getUniqId';
import axios from 'axios';
import fs from 'fs';
import { Scenes } from 'telegraf';

export const getAndSaveImage = async (ctx: Scenes.WizardContext<Scenes.WizardSessionData>): Promise<string> => {
    try {
        let imageUrl = '';
        if (typeof ctx.from === 'undefined' || ctx.from?.is_bot) return '';
        const tgMessage = ctx.message;
        const photoTgMessage = tgMessage && 'photo' in tgMessage ? tgMessage.photo : undefined;

        if (photoTgMessage && photoTgMessage.length > 0) {
            const fileId = photoTgMessage[2].file_id || photoTgMessage[1].file_id || photoTgMessage[0].file_id;

            try {
                const url = await ctx.telegram.getFileLink(fileId);

                const filename = getUniqId();
                // @ts-ignore
                const response = await axios({ url, responseType: 'stream' });
                await new Promise((resolve, reject) => {
                    response.data
                        .pipe(fs.createWriteStream(`./src/static/${filename}.jpg`))
                        .on('finish', () => resolve(''))
                        .on('error', (e: any) => {
                            console.log('getAndSaveImage -> await new Promise', e);
                            reject();
                        });
                });

                imageUrl = `http://verdant-yucca.ru:3001/static/${filename}.jpg`;
            } catch (e) {
                console.error('getAndSaveImage -> ctx.telegram.getFileLink -> catch', e);
            }
        }
        return imageUrl;
    } catch (e) {
        console.error('getAndSaveImage -> catch', e);
        return '';
    }
};
