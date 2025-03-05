
import type { GadgetModel } from "gadget-server";

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-CreditSetting",
  fields: {
    name: {
      type: "string",
      validations: { required: true },
    },
    metafieldKey: {
      type: "string",
      validations: { required: true },
    },
    metafieldNamespace: {
      type: "string",
      validations: { required: true, default: "customer" },
    },
    discountType: {
      type: "enum",
      values: ["percentage", "fixed_amount"],
      validations: { required: true },
    },
    discountValue: {
      type: "number",
      validations: { required: true },
    },
    minimumCreditRequired: {
      type: "number",
      validations: { required: true, default: 1 },
    },
    discountCodePrefix: {
      type: "string",
      validations: { required: false },
    },
    isActive: {
      type: "boolean",
      validations: { required: true, default: true },
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      validations: { required: true },
    },
  },
};
