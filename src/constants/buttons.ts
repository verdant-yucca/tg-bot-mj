import { Markup } from 'telegraf';

export const getMainMenu = () => {
    return Markup.keyboard([
        ['🎨 Создать картину'],
        ['🖌 Стилизовать аватар'],
        ['🖌 Стилизовать фото'],
        ['📞 Help']
        // ['🎭 Создать стикер', '🔄 Изменить модель']
    ]).resize();
};
