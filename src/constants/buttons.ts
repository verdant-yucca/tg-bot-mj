import { Markup } from 'telegraf';
import { textButton1, textButton2, textButton3, textButton4, textButton5 } from './messages';

export const getMainMenu = () =>
    Markup.keyboard([
        [textButton1()],
        [textButton3()],
        [textButton4(), textButton5()],
        // ['🎭 Создать стикер', '🔄 Изменить модель']
    ]).resize();
