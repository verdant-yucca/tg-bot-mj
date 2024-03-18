module.exports = {
    apps: [
        {
            name: 'midjourney bot',
            script: './dist/src/index.js', // Путь к файлу вашего приложения
            watch: false, // Автоматически перезапускать при изменениях в файлах
            env: {
                PORT: 3001
            },
        }
    ],
};
