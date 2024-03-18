import { DotenvParseOutput, config } from 'dotenv';
import { IConfigService } from './config.interface';

export class ConfigService implements IConfigService {
    private config: DotenvParseOutput;

    constructor() {
        const { error, parsed } = config();
        if (error || !parsed) {
            const { error, parsed } = config({ path: './tg-bot-mj/dist/.env' });
            if (error) throw new Error('Не найден файл .env');
            if (!parsed) throw new Error('Пустой файл .env');
            this.config = parsed;
        } else {
            this.config = parsed;
        }
    }

    get(key: string): string {
        const value = this.config[key];
        if (!value) throw new Error('Нет такого ключа в .env');
        return value;
    }
}
