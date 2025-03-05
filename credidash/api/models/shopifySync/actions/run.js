import {
  transitionState,
  applyParams,
  preventCrossShopDataAccess,
  save,
  shopifySync,
  ActionOptions,
  ShopifySyncState,
} from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  transitionState(record, { to: ShopifySyncState.Running });
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
  await shopifySync(params, record);
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
  triggers: { api: true },
};
