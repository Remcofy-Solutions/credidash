import {
  transitionState,
  applyParams,
  save,
  ActionOptions,
  ShopifyShopState,
} from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  transitionState(record, { to: ShopifyShopState.Installed });
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({
  params,
  record,
  logger,
  api,
  connections,
}) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: false },
};
