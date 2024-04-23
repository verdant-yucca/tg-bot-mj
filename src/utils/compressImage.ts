import sharp from 'sharp';
import axios from 'axios';

export const compressImage = async (imageUrl: string): Promise<Buffer | 1> => {
    try {
        // Качество сжатия (от 0 до 100, где 100 - наилучшее качество)
        const quality = 80;

        // Загрузка изображения по URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Сжатие изображения с потерей качества
        return await sharp(response.data)
            .jpeg({ quality: quality })
            .toBuffer();
    } catch {
        return 1;
    }

};