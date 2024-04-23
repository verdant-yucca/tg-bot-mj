import { getPackages } from './db/packages';

export const getInvoicePayments = async (id: number): Promise<any[]> => {
    const { packages } = await getPackages();
    return packages.map(({ count, name, price, title, description, photoUrl, photoWidth, photoHeight }) => ({
        chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
        provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот юкассы
        start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
        title: title, // Название продукта, 1-32 символа
        description: description, // Описание продукта, 1-255 знаков
        currency: 'RUB', // Трехбуквенный код валюты ISO 4217
        prices: [{ label: name, amount: price * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
        photo_url: photoUrl, // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
        photo_width: photoWidth, // Ширина фото
        photo_height: photoHeight, // Длина фото
        need_email: true,
        send_email_to_provider: true,
        provider_data: {
            receipt: {
                items: [{
                    description: `Покупка ${title} в телеграм боте`,
                    quantity: 1,
                    measure: 'piece',
                    payment_subject: 'service', // Услуга
                    amount: {
                        value: `${price}.00`,
                        currency: 'RUB'
                    },
                    vat_code: 1
                }]
            }
        },
        payload: {
            // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
            packageName: name,
            price: price,
            count: count
        }
    }));
};
