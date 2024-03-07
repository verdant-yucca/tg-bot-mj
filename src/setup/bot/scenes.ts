import { Scenes } from 'telegraf';
import { stepStart, generateByTextStep1, generateByTextStep2, generateByTextStep3 } from '../../views';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', stepStart);
const generateByTextScene = new Scenes.WizardScene<Scenes.WizardContext>('generateByTextScene', generateByTextStep1, generateByTextStep2, generateByTextStep3);


export const stage = new Scenes.Stage<Scenes.WizardContext>([startScene, generateByTextScene]);
