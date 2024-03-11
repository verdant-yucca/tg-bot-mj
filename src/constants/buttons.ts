import { Markup } from 'telegraf';

export const getMainMenu = () => {
  return Markup.keyboard([
    ['🎨 Создать картину'],
    ['🔮 Экспериментировать', '🖌 Стилизовать изображение'],
    ['🎭 Создать стикер', '🔄 Изменить модель']
  ]).resize();
};
