import {
  transitionState,
  applyParams,
  preventCrossShopDataAccess,
  save,
  ActionOptions,
  ShopifyShopState,
} from "gadget-server";
import { trialCalculations } from "../helpers";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  transitionState(record, {
    from: ShopifyShopState.Installed,
    to: ShopifyShopState.Uninstalled,
  });
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);

  const planMatch = await api.plan.maybeFindFirst({
    filter: {
      id: {
        equals: record.planId,
      },
    },
    select: {
      trialDays: true,
    },
  });

  if (planMatch) {
    // Calculating the usedTrialMinutes value so that any subsequent install and plan selection can have a more accurate number of trial days set
    const { usedTrialMinutes } = trialCalculations(
      record.usedTrialMinutes,
      record.usedTrialMinutesUpdatedAt,
      new Date(),
      planMatch.trialDays
    );

    record.usedTrialMinutes = usedTrialMinutes;
    record.usedTrialMinutesUpdatedAt = null;
  }

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
  if (record.activeRecurringSubscriptionId) {
    await api.internal.shopifyAppSubscription.update(
      record.activeRecurringSubscriptionId,
      {
        status: "CANCELLED",
      }
    );
  }

  await api.internal.shopifyShop.update(record.id, {
    activeRecurringSubscriptionId: null,
    plan: null,
  });
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
