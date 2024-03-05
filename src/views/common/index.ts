import { IBackToStepData, IStateData } from '../../types';

export const backToStepHandler = async ({ ctx, indexStep, value, handle }: IBackToStepData) => {
  ctx.wizard.selectStep(indexStep);
  const state = ctx.wizard.state as IStateData;
  await ctx.deleteMessage(state.lastMsgId);
  const res = await handle(ctx, value);
  state.lastMsgId = res.message_id;
};
