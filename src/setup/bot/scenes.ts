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
import {
  enterYourImageStep1,
  enterYourTextStep2,
  stylingImageByTextStep3
} from '../../views/start/generateByImageAndTextScene';
import {
  enterYourImageStep1 as blandImageSceneStep1,
  enterYourTextStep2 as blandImageSceneStep2,
  stylingImageByTextStep3 as blandImageSceneStep3
} from '../../views/start/generateByBlandImageScene';

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
