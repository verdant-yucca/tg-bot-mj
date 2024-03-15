import { Scenes } from 'telegraf';
import { startSceneStep } from 'src/views/startScene';
import { enterYourTextStep1, generateImageByTextStep2 } from 'src/views/generateByTextScene';
import {
    generateMoreOrUpscaleStep,
    generateMoreOrUpscaleAwaitStep
} from 'src/views/generateMoreOrUpscaleScene';
import {
    enterYourTextStep1 as stylingAvatarEnterYourTextStep1,
    stylingAvatarByTextStep2
} from 'src/views/stylingAvatarByTextScene';
import {
    enterYourImageStep1,
    enterYourTextStep2,
    stylingImageByTextStep3
} from 'src/views/generateByImageAndTextScene';

import {
    enterYourImageStep1 as blandImageSceneStep1,
    enterYourTextStep2 as blandImageSceneStep2,
    stylingImageByTextStep3 as blandImageSceneStep3
} from 'src/views/generateByBlandImageScene';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', startSceneStep);
const generateByTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByTextScene',
    enterYourTextStep1,
    generateImageByTextStep2
);

const generateByImageAndTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByImageAndTextScene',
    enterYourImageStep1,
    enterYourTextStep2,
    stylingImageByTextStep3
);

const stylingAvatarByTextScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'stylingAvatarByTextScene',
    stylingAvatarEnterYourTextStep1,
    stylingAvatarByTextStep2
);
const generateByBlandImageScene = new Scenes.WizardScene<Scenes.WizardContext>(
    'generateByBlandImageScene',
    blandImageSceneStep1,
    blandImageSceneStep2,
    blandImageSceneStep3
);

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
