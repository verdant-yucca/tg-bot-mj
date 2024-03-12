import { Scenes } from 'telegraf';
import { startSceneStep } from '../../views/start/startScene';
import { enterYourTextStep1, generateImageByTextStep2 } from '../../views/start/generateByTextScene';
import {
    generateMoreOrUpscaleStep,
    generateMoreOrUpscaleAwaitStep
} from '../../views/start/generateMoreOrUpscaleScene';
import {
    enterYourTextStep1 as stylingAvatarEnterYourTextStep1,
    stylingAvatarByTextStep2
} from '../../views/start/stylingAvatarByTextScene';

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

const stylingAvatarByTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'stylingAvatarByTextScene',
    stylingAvatarEnterYourTextStep1, stylingAvatarByTextStep2
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
    generateMoreOrUpscaleScene,
    stylingAvatarByTextScene
]);
