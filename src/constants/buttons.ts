import { Markup } from 'telegraf';

export const getMainMenu = () => {
    return Markup.keyboard([
        ['🎨 Создать картину', '🖌 Стилизовать аватар'],
        ['🖌 Стилизовать фото', '🔮 Экспериментировать'],
        ['📞 Help']
        // ['🎭 Создать стикер', '🔄 Изменить модель']
    ]).resize();
};
