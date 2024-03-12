import { Markup } from 'telegraf';

export const getMainMenu = () => {
    return Markup.keyboard([
        ['🎨 Создать картину'],
        ['🖌 Стилизовать аватар']
        // ['🎭 Создать стикер', '🔄 Изменить модель']
    ]).resize();
};
