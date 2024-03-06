import { Scenes } from 'telegraf';
import { stepStart, generateByTextStep } from '../../views';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', stepStart);
const generateByTextScene = new Scenes.WizardScene<Scenes.WizardContext>('generateByTextScene', generateByTextStep);

export const stage = new Scenes.Stage<Scenes.WizardContext>([startScene, generateByTextScene]);
