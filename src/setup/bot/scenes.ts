import { Scenes } from 'telegraf';
import { stepStart } from '../../views';

const startScene = new Scenes.WizardScene<Scenes.WizardContext>('startScene', stepStart);

export const stage = new Scenes.Stage<Scenes.WizardContext>([startScene]);
