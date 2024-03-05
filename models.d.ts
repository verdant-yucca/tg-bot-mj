declare namespace ApiTypes {
  export interface AuthDto {
    chatId: string;
    languageCode?: string;
    username?: string;
    firstName: string;
    lastName?: string;
    avatarPath?: string;
  }
  export interface AuthResponse {
    jwt: string;
    user: UserResponse;
  }
  export interface Battery {
    id: number;
    createdAt: string;
    updatedAt: string;
    percent: string;
    isChallenge: boolean;
    user: User;
    mood: BatteryEmotion[];
    trigger: BatteryEmotion[];
  }
  export interface BatteryEmotion {
    value: string;
    emotion: EmotionItem;
  }
  export interface BatteryEmotionDto {
    value: string;
    emotionId: number;
  }
  export interface BatteryPage {
    myBatteryTitle: ItemLang;
    intervals: IntervalBatteryPage[];
    chooseMoodTitle: ItemLang;
    yourMoodTitle: ItemLang;
    chooseEmotionTitle: ItemLang;
    whatTriggeredTitle: ItemLang;
    thanksTitle: ItemLang;
    thanksDescription: ItemLang;
    thanksMedia: Media;
    whatMoodTitle: ItemLang;
    batteryTodayTitle: ItemLang;
    batteryTodayText: ItemLang;
    chooseMoodText: ItemLang;
    chooseEmotionText: ItemLang;
    quitTitle: ItemLang;
    quitText: ItemLang;
  }
  export interface ButtonCommon {
    jungjiBtn: ItemLang;
    myBatterylevelBtn: ItemLang;
    chooseGoalBtn: ItemLang;
    surpriseMeBtn: ItemLang;
    feedbackBtn: ItemLang;
    changeBtn: ItemLang;
    saveChangesBtn: ItemLang;
    sendBtn: ItemLang;
    goodToKnowBtn: ItemLang;
    wantToKnowBtn: ItemLang;
    nextBtn: ItemLang;
    chooseBtn: ItemLang;
    closeBtn: ItemLang;
    goFirstStepBtn: ItemLang;
    singUpBtn: ItemLang;
    okayBtn: ItemLang;
    startChallengeBtn: ItemLang;
    cancelBtn: ItemLang;
    getFirstTaskBtn: ItemLang;
    fillBtn: ItemLang;
    skipBtn: ItemLang;
    doneBtn: ItemLang;
    nextStageBtn: ItemLang;
    yesCloseBtn: ItemLang;
    getCardBtn: ItemLang;
    oneMoreCardBtn: ItemLang;
    dayBtn: ItemLang;
    removeBtn: ItemLang;
    sendToEmailBtn: ItemLang;
    proceedBtn: ItemLang;
    wowGotItBtn: ItemLang;
    goToMainBtn: ItemLang;
    seeAllBtn: ItemLang;
    startNowBtn: ItemLang;
    readBtn: ItemLang;
    chooseCardsBtn: ItemLang;
    chooseAgainBtn: ItemLang;
    todayMenuBtn: ItemLang;
    programMenuBtn: ItemLang;
    profileMenuBtn: ItemLang;
    saveBtn: ItemLang;
    continueBtn: ItemLang;
    updateBtn: ItemLang;
    discardBtn: ItemLang;
    finishBtn: ItemLang;
    backToHomepageBtn: ItemLang;
    quitBtn: ItemLang;
    stayBtn: ItemLang;
  }
  export interface Challenge {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    tasks: ChallengeTask[];
  }
  export interface ChallengeResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    tasks: ChallengeTaskResponse[];
  }
  export interface ChallengeTask {
    id: number;
    createdAt: string;
    updatedAt: string;
    title: ItemLang;
    task: ItemLang;
    taskShort: ItemLang;
    motivationalText: ItemLang;
    profile: Profile;
    media: Media;
    level: number;
    number: number;
    challenge: Challenge;
  }
  export interface ChallengeTaskResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    title: ItemLang;
    task: ItemLang;
    taskShort: ItemLang;
    motivationalText: ItemLang;
    media: Media;
    level: number;
    number: number;
  }
  export interface Common {
    buttons: ButtonCommon;
  }
  export interface ContentResponse {
    emotions: EmotionItem[];
    batteryPage: BatteryPage;
    common: Common;
    feedbackPage: FeedbackPage;
    goalPage: GoalPage;
    jungjiPage: JungjiPage;
    profilePage: ProfilePage;
    registrationPage: RegistrationPage;
    subscribePage: SubscribePage;
    workLifeBalanceContent: WorkLifeBalanceContent;
    surpriseMeContent: SurpriseMeContent;
    mainPage: MainPage;
  }
  export interface CreateBatteryDto {
    percent: string;
    isChallenge: boolean;
    mood: BatteryEmotionDto[];
    trigger: BatteryEmotionDto[];
  }
  export interface CreateChallengeDto {
    challengeId: number;
    emotionIds: number[];
    nextLevel?: number;
  }
  export interface CreateFeedbackDto {
    comment: string;
    rating: number;
    page: string;
    isError: boolean;
  }
  export interface CreateUserCardDto {
    cardId: number;
    answer: string;
  }
  export interface EmotionItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    icon: Media;
    title: ItemLang;
    description?: ItemLang;
    type: EmotionTypeEnum;
    number: number;
    placeholder?: ItemLang;
    tips?: ItemLang[];
  }
  export type EmotionTypeEnum = 'mood' | 'trigger';
  export interface ErrorResponse {
    message: string;
    statusCode: number;
    error?: string;
  }
  export interface FeedbackPage {
    title: ItemLang;
    commentLabel: ItemLang;
    placeholder: ItemLang;
    checkboxText: ItemLang;
  }
  export interface GoalPage {
    chooseGoalTitle: ItemLang;
    yourGoalTitle: ItemLang;
    activeChallengeText: ItemLang;
    notActiveChallengeText: ItemLang;
  }
  export interface IntervalBatteryPage {
    text: ItemLang;
    to: number;
    from: number;
  }
  export interface ItemLang {
    ru: string;
    en: string;
    vi: string;
    in: string;
  }
  export interface JungjiPage {
    title: ItemLang;
  }
  export interface MainPage {
    greetingTitle: ItemLang;
    passedBatteryText: ItemLang;
    notPassedBatteryText: ItemLang;
    programTitle: ItemLang;
    programText: ItemLang;
    todayTaskText: ItemLang;
    surpriseMeTitle: ItemLang;
    chooseText: ItemLang;
    comebackText: ItemLang;
  }
  export interface Media {
    id: number;
    url: string;
    name: string;
    width?: string;
    height?: string;
    ext: string;
    mime: string;
    size: string;
  }
  export interface OptionQuestionnaire {
    id: number;
    createdAt: string;
    updatedAt: string;
    value: ItemLang;
    scores: number;
    questions: QuestionQuestionnaire[];
  }
  export interface Profile {
    id: number;
    createdAt: string;
    updatedAt: string;
    profile: UserProfile;
    wellBeing: UserWellBeing;
  }
  export interface ProfilePage {
    title: ItemLang;
    nameLabel: ItemLang;
    languageLabel: ItemLang;
    subscriptionLabel: ItemLang;
    challengesLabel: ItemLang;
    daysPassedLabel: ItemLang;
    typeLabel: ItemLang;
    emailLabel: ItemLang;
    ageLabel: ItemLang;
    basicInfoTitle: ItemLang;
  }
  export interface ProfileResponse {
    wellBeing: UserWellBeing;
    profile: UserProfileResponse;
  }
  export interface QuestionQuestionnaire {
    id: number;
    createdAt: string;
    updatedAt: string;
    question: ItemLang;
    options: OptionQuestionnaire[];
    questionnaire: Questionnaire;
    number: number;
  }
  export interface Questionnaire {
    id: number;
    createdAt: string;
    updatedAt: string;
    number: number;
    title: ItemLang;
    questions: QuestionQuestionnaire[];
  }
  export interface RandomizerJungjiItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    media: Media;
    description: ItemLang;
  }
  export interface RandomizerMetaCardItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    media: Media;
    pull: number;
  }
  export interface RegistrationPage {
    mailLabel: ItemLang;
    ageLabel: ItemLang;
    checkboxText: ItemLang;
    confirmText: ItemLang;
    testResultTitle: ItemLang;
    yourTypeLabel: ItemLang;
    helloTitle: ItemLang;
    media: Media;
  }
  export interface SaveUserQuestionnaireDto {
    questionnaireId: number;
    answersIds: number[];
  }
  export interface SendReplyDto {
    userChallengeId: number;
    taskId: number;
    answer?: string;
  }
  export interface StepWorkLifeBalance {
    title: ItemLang;
    description: ItemLang;
  }
  export interface SubscribePage {
    subscribeTitle: ItemLang;
    subscribeText: ItemLang;
    media: Media;
    cancelTitle: ItemLang;
    cancelText: ItemLang;
  }
  export interface SuccessMessageResponse {
    message: string;
  }
  export interface SurpriseMeContent {
    titleFirstCard: ItemLang;
    textFirstCard: ItemLang;
    titleSuccess: ItemLang;
    textSuccess: ItemLang;
    titleSecondCard: ItemLang;
    titleResource: ItemLang;
    textResource: ItemLang;
    placeholderResource: ItemLang;
    placeholderSuccess: ItemLang;
    titleFinally: ItemLang;
    mediaFinally: Media;
    congratulationTitle: ItemLang;
    congratulationSuccessTitle: ItemLang;
    congratulationSuccessText: ItemLang;
    congratulationAchieveTitle: ItemLang;
    congratulationAchieveText: ItemLang;
  }
  export interface UpdateMeDto {
    firstName?: string;
    languageCode?: string;
    userEmail?: string;
    avatar?: number;
    age?: string;
    isHealthProblems?: boolean;
  }
  export interface User {
    id: number;
    createdAt: string;
    updatedAt: string;
    chatId: string;
    languageCode: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    isHealthProblems: boolean;
    username: string;
    firstName: string;
    lastName?: string | null;
    lastActive?: string | null; // date-time
    email?: string | null;
    userEmail?: string | null;
    age?: string | null;
    avatar?: {
      id: number;
      url: string;
      name: string;
      width?: string;
      height?: string;
      ext: string;
      mime: string;
      size: string;
    } | null;
    batteries?: any[][];
    lastBattery?: {
      id: number;
      createdAt: string;
      updatedAt: string;
      percent: string;
      isChallenge: boolean;
      user: User;
      mood: BatteryEmotion[];
      trigger: BatteryEmotion[];
    } | null;
    challenges?: UserChallenge[];
    currrentChallenges?: UserChallenge[];
    questionnaires?: UserQuestionnaire[];
    profile?: {
      id: number;
      createdAt: string;
      updatedAt: string;
      profile: UserProfile;
      wellBeing: UserWellBeing;
    } | null;
    orders?: string[];
    subscriptions?: string[];
    activeSubscription?: string | null;
    metaCards?: UserCard[];
  }
  export interface UserBatteryResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    percent: string;
    isChallenge: boolean;
  }
  export interface UserCard {
    id: number;
    createdAt: string;
    updatedAt: string;
    user: User;
    card: RandomizerMetaCardItem;
    answer: string;
    pull: number;
  }
  export interface UserCardResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    card: RandomizerMetaCardItem;
    answer: string;
    pull: number;
  }
  export interface UserChallenge {
    id: number;
    createdAt: string;
    updatedAt: string;
    challenge: Challenge;
    emotions: EmotionItem[];
    tasks: UserChallengeTask[];
    user: User;
    level?: number;
  }
  export interface UserChallengeResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    level?: number;
    challenge: ChallengeResponse;
    tasks: UserChallengeTaskResponse[];
  }
  export interface UserChallengeTask {
    id: number;
    task: ChallengeTask;
    answer: string;
    status: UserChallengeTaskEnum;
    date: string; // date-time
  }
  export type UserChallengeTaskEnum = 'available' | 'notAvailable' | 'completed';
  export interface UserChallengeTaskResponse {
    id: number;
    answer: string;
    status: UserChallengeTaskEnum;
    date: string; // date-time
  }
  export interface UserProfile {
    id: number;
    createdAt: string;
    updatedAt: string;
    slug: UserProfileSlugEnum;
    name: ItemLang;
    resultText: ItemLang;
    helloText: ItemLang;
    questions: QuestionQuestionnaire[];
  }
  export interface UserProfileResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    slug: UserProfileSlugEnum;
    name: ItemLang;
    resultText: ItemLang;
    helloText: ItemLang;
  }
  export type UserProfileSlugEnum = 'thinker' | 'persister' | 'rebel' | 'promoter' | 'imaginer' | 'harmonizer';
  export interface UserQuestionnaire {
    id: number;
    createdAt: string;
    updatedAt: string;
    questionnaire: Questionnaire;
    user: User;
    answers: UserQuestionnaireAnswer[];
  }
  export interface UserQuestionnaireAnswer {
    option: OptionQuestionnaire;
  }
  export interface UserQuestionnaireResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    number: number;
  }
  export interface UserResponse {
    id: number;
    createdAt: string;
    updatedAt: string;
    chatId: string;
    languageCode: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    isHealthProblems: boolean;
    username: string;
    firstName: string;
    lastName?: string | null;
    lastActive?: string | null; // date-time
    email?: string | null;
    userEmail?: string | null;
    age?: string | null;
    avatar?: {
      id: number;
      url: string;
      name: string;
      width?: string;
      height?: string;
      ext: string;
      mime: string;
      size: string;
    } | null;
    challenges?: UserChallenge[];
    orders?: string[];
    subscriptions?: string[];
    activeSubscription?: string | null;
    lastBattery: UserBatteryResponse;
    questionnaires: UserQuestionnaireResponse[];
    profile: ProfileResponse;
    currrentChallenges: UserChallengeResponse[];
    metaCards: UserCardResponse[];
  }
  export interface UserWellBeing {
    id: number;
    createdAt: string;
    updatedAt: string;
    from: number;
    to: number;
    description: ItemLang;
  }
  export interface WorkLifeBalanceContent {
    title: ItemLang;
    steps: StepWorkLifeBalance[];
    areasTitle: ItemLang;
    areasText: ItemLang;
    congratulationTitle: ItemLang;
    congratulationText: ItemLang;
    congratulationMedia: Media;
    answerTitle: ItemLang;
    answerText: ItemLang;
    answerPlaceholder: ItemLang;
    confirmationTitle: ItemLang;
    confirmationText: ItemLang;
    finallyTitle: ItemLang;
    finallyText: ItemLang;
    finallyMedia: Media;
    icon: Media;
    welldoneText: ItemLang;
  }
}
declare namespace Paths {
  namespace AuthControllerGetMe {
    export type RequestBody = Components.Schemas.AuthDto;
    namespace Responses {
      export type $200 = Components.Schemas.AuthResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace BatteryControllerCreate {
    export type RequestBody = Components.Schemas.CreateBatteryDto;
    namespace Responses {
      export type $200 = Components.Schemas.SuccessMessageResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace ChallengeControllerCreate {
    export type RequestBody = Components.Schemas.CreateChallengeDto;
    namespace Responses {
      export type $200 = Components.Schemas.UserChallengeResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace ChallengeControllerGetAll {
    namespace Responses {
      export type $200 = Components.Schemas.ChallengeResponse[];
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace ChallengeControllerSendReply {
    export type RequestBody = Components.Schemas.SendReplyDto;
    namespace Responses {
      export type $200 = boolean;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace ContentControllerGetContent {
    namespace Responses {
      export type $200 = Components.Schemas.ContentResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace QuestionnaireControllerGetAll {
    namespace Responses {
      export type $200 = Components.Schemas.Questionnaire[];
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace QuestionnaireControllerHandlerResults {
    namespace Responses {
      export type $200 = Components.Schemas.ProfileResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace QuestionnaireControllerSaveUserQuestionnaire {
    export type RequestBody = Components.Schemas.SaveUserQuestionnaireDto;
    namespace Responses {
      export type $200 = boolean;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace QuestionnaireControllerSendResults {
    namespace Responses {
      export type $200 = boolean;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace RandomizerControllerRandomizerJungji {
    namespace Responses {
      export type $200 = Components.Schemas.RandomizerJungjiItem;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace RandomizerControllerRandomizerMetaCards {
    namespace Parameters {
      export type Pull = string;
    }
    export interface PathParameters {
      pull: Parameters.Pull;
    }
    namespace Responses {
      export type $200 = Components.Schemas.RandomizerMetaCardItem;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace TaskControllerGetJobByName {
    namespace Parameters {
      export type Name = string;
    }
    export interface PathParameters {
      name: Parameters.Name;
    }
    namespace Responses {
      export interface $200 {}
    }
  }
  namespace TaskControllerGetJobs {
    namespace Responses {
      export interface $200 {}
    }
  }
  namespace UploadControllerUploadFile {
    export interface RequestBody {
      file?: string; // binary
    }
    namespace Responses {
      export type $201 = Components.Schemas.Media;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerCreateFeedback {
    export type RequestBody = Components.Schemas.CreateFeedbackDto;
    namespace Responses {
      export type $200 = boolean;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerGetAll {
    namespace Responses {
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerGetLastMetaCards {
    namespace Responses {
      export type $200 = Components.Schemas.UserCardResponse[];
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerGetMe {
    namespace Responses {
      export type $200 = Components.Schemas.UserResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerSaveMetaCard {
    export type RequestBody = Components.Schemas.CreateUserCardDto;
    namespace Responses {
      export type $200 = boolean;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace UserControllerUpdateMe {
    export type RequestBody = Components.Schemas.UpdateMeDto;
    namespace Responses {
      export type $200 = Components.Schemas.UserResponse;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $403 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
}
