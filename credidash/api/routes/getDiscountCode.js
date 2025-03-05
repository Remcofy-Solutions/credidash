
import { uuidv4 } from "gadget-server";

/**
 * @param {import("gadget-server").RouteContext} request
 */
export default async function (request) {
  const { api, params, logger, connections } = request;
  
  try {
    // Validate request
    const { shopDomain, customerId, metafieldKey, metafieldNamespace = "customer" } = params.query;
    
    if (!shopDomain || !customerId || !metafieldKey) {
      return {
        status: 400,
        body: { error: "Missing required parameters" }
      };
    }
    
    // Find the shop
    const shop = await api.shopifyShop.findFirst({
      where: { domain: shopDomain },
    });
    
    if (!shop) {
      return {
        status: 404,
        body: { error: "Shop not found" }
      };
    }
    
    // Find matching credit setting
    const creditSetting = await api.creditSetting.findFirst({
      where: { 
        metafieldKey,
        metafieldNamespace,
        shop: { equals: shop.id },
        isActive: true
      }
    });
    
    if (!creditSetting) {
      return {
        status: 404,
        body: { error: "Credit setting not found" }
      };
    }
    
    // Get customer metafield (credit) value using Shopify API
    const shopify = connections.shopify.forShop(shop.id);
    const { data } = await shopify.graphql(`
      query getCustomerMetafield($customerId: ID!, $namespace: String!, $key: String!) {
        customer(id: $customerId) {
          metafield(namespace: $namespace, key: $key) {
            value
          }
        }
      }
    `, {
      customerId: `gid://shopify/Customer/${customerId}`,
      namespace: metafieldNamespace,
      key: metafieldKey
    });
    
    const metafieldValue = data?.customer?.metafield?.value;
    
    if (!metafieldValue) {
      return {
        status: 404,
        body: { error: "Customer credit metafield not found" }
      };
    }
    
    const creditValue = Number(metafieldValue);
    
    // Check if customer has enough credit
    if (creditValue < creditSetting.minimumCreditRequired) {
      return {
        status: 400,
        body: { 
          error: "Insufficient credit",
          required: creditSetting.minimumCreditRequired,
          available: creditValue
        }
      };
    }
    
    // Generate discount code
    const prefix = creditSetting.discountCodePrefix || "CREDIT";
    const discountCode = `${prefix}-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create discount using Shopify API
    const discountResponse = await shopify.graphql(`
      mutation discountCodeBasicCreate($input: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $input) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      input: {
        title: `Credit Discount for Customer ${customerId}`,
        code: discountCode,
        startsAt: new Date().toISOString(),
        customerSelection: {
          customers: {
            add: [`gid://shopify/Customer/${customerId}`]
          }
        },
        customerGets: {
          value: {
            [creditSetting.discountType === "percentage" ? "percentage" : "amount"]: creditSetting.discountValue
          },
          items: {
            all: true
          }
        },
        appliesOncePerCustomer: true
      }
    });
    
    if (discountResponse.data?.discountCodeBasicCreate?.userErrors?.length > 0) {
      return {
        status: 400,
        body: { 
          error: "Failed to create discount code",
          details: discountResponse.data.discountCodeBasicCreate.userErrors
        }
      };
    }
    
    // Return the discount code
    return {
      status: 200,
      body: {
        discountCode,
        discountType: creditSetting.discountType,
        discountValue: creditSetting.discountValue,
        creditUsed: creditSetting.minimumCreditRequired
      }
    };
    
  } catch (error) {
    logger.error("Error generating discount code", error);
    return {
      status: 500,
      body: { error: "Internal server error" }
    };
  }
}
