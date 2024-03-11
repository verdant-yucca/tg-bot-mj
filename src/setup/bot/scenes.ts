import { Scenes } from 'telegraf';
import {
    startSceneStep,
    enterYourTextStep1,
    generateImageByTextStep2,
    generateMoreOrUpscaleStep,
    generateMoreOrUpscaleAwaitStep
} from '../../views';
import { notAccessMsg } from '../../constants/messages';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', startSceneStep);
const generateByTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByTextScene',
    enterYourTextStep1,
    generateImageByTextStep2
);

const generateByImageAndTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByImageAndTextScene',
    () => {
    }
);
const generateByBlandImageScene = new Scenes.WizardScene<Scenes.WizardContext>('generateByBlandImageScene', () => {
});

const generateMoreOrUpscaleScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateMoreOrUpscaleScene',
    generateMoreOrUpscaleAwaitStep,
    generateMoreOrUpscaleStep
);

export const stage = new Scenes.Stage<Scenes.WizardContext>([
    startScene,
    generateByTextScene,
    generateByImageAndTextScene,
    generateByBlandImageScene,
    generateMoreOrUpscaleScene
]);
