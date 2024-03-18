module.exports = {
    apps: [
        {
            name: 'midjourney bot',
            script: './dist/index.js', // Путь к файлу вашего приложения
            watch: true, // Автоматически перезапускать при изменениях в файлах
            env: {
                PORT: 3001
            },
        }
    ],
};
