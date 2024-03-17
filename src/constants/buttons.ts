import { Markup } from 'telegraf';
import { textButton1 } from './messages';

export const getMainMenu = () =>
    Markup.keyboard([
        [textButton1(), '🖌 Стилизовать аватар'],
        ['🖌 Стилизовать фото', '🔮 Экспериментировать'],
        ['📞 Help'],
        // ['🎭 Создать стикер', '🔄 Изменить модель']
    ]).resize();
