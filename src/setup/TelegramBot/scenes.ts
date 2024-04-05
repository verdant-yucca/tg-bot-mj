import { Scenes } from 'telegraf';
import { startSceneStep } from './views/startScene';
import { enterYourTextStep1, generateImageByTextStep2 } from './views/generateByTextScene';
import { generateMoreOrUpscaleStep } from './views/generateMoreOrUpscaleScene';
import { enterYourImageStep1, enterYourTextStep2, stylingImageByTextStep3 } from './views/generateByImageAndTextScene';
import { sendSettingsStep1 } from './views/settingsScene';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', startSceneStep);
const generateByTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByTextScene',
    enterYourTextStep1,
    generateImageByTextStep2,
);

const generateByImageAndTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByImageAndTextScene',
    enterYourImageStep1,
    enterYourTextStep2,
    stylingImageByTextStep3,
);

const generateMoreOrUpscaleScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateMoreOrUpscaleScene',
    generateMoreOrUpscaleStep,
);

const settingsScene = new Scenes.WizardScene<Scenes.WizardContext>('settingsScene', sendSettingsStep1);

export const stage = new Scenes.Stage<Scenes.WizardContext>([
    startScene,
    generateByTextScene,
    generateByImageAndTextScene,
    generateMoreOrUpscaleScene,
    settingsScene,
]);
