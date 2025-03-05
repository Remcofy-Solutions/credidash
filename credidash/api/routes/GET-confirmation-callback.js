import { RouteHandler } from "gadget-server";

/** @type { RouteHandler } */
const route = async ({ request, reply, api, logger, connections }) => {
  const { shop_id, plan_id } = request.query;

  // Updating the shop with the relevant information
  const shop = await api.internal.shopifyShop.update(shop_id, {
    plan: {
      _link: plan_id,
    },
  });

  // Sending the user back to the admin UI
  await reply.redirect(
    `https://${shop.domain}/admin/apps/${shop.installedViaApiKey}`
  );
};
