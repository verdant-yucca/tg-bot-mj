import {
    textButton1,
    textButton2,
    textButton3,
    textButton4,
    textButton5,
    textButtonAlreadySubscribed
} from './messages';

export const commands = {
    start: {
        command: 'start',
        title: 'Start bot',
        description: 'use /start to Start the bot',
    },
    createPicture: {
        command: textButton1(),
        title: textButton1(),
        description: '',
    },
    experiment: {
        command: textButton4(),
        title: textButton4(),
        description: '',
    },
    stylingAvatar: {
        command: textButton2(),
        title: textButton2(),
        description: '',
    },
    stylingImage: {
        command: textButton3(),
        title: textButton3(),
        description: '',
    },
    help: {
        command: textButton5(),
        title: textButton5(),
        description: '',
    },
    alreadySubscribes: {
        command: textButtonAlreadySubscribed(),
        title: textButtonAlreadySubscribed(),
        description: '',
    },
    exit: {
        command: 'exit',
        title: 'Exit bot',
        description: 'use /exit to Exit the bot',
    },
    back: {
        command: 'back',
        title: '<< Назад',
        description: 'Назад',
    },
};
