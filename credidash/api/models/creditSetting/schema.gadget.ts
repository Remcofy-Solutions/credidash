
import type { GadgetModel } from "gadget-server";

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-CreditSetting",
  fields: {
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "ModelField-name-CreditSetting",
    },
    metafieldKey: {
      type: "string",
      validations: { required: true },
      storageKey: "ModelField-metafieldKey-CreditSetting",
    },
    metafieldNamespace: {
      type: "string",
      default: "customer",
      validations: { required: true },
      storageKey: "ModelField-metafieldNamespace-CreditSetting",
    },
    discountType: {
      type: "enum",
      values: ["percentage", "fixed_amount"],
      validations: { required: true },
      storageKey: "ModelField-discountType-CreditSetting",
    },
    discountValue: {
      type: "number",
      validations: { required: true },
      storageKey: "ModelField-discountValue-CreditSetting",
    },
    minimumCreditRequired: {
      type: "number",
      default: 1,
      validations: { required: true },
      storageKey: "ModelField-minimumCreditRequired-CreditSetting",
    },
    discountCodePrefix: {
      type: "string",
      validations: { required: false },
      storageKey: "ModelField-discountCodePrefix-CreditSetting",
    },
    isActive: {
      type: "boolean",
      default: true,
      validations: { required: true },
      storageKey: "ModelField-isActive-CreditSetting",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      validations: { required: true },
      storageKey: "ModelField-shop-CreditSetting",
    },
  },
};
