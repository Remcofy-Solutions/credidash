import { BlockStack, Layout, Page, Text, Card, Button } from "@shopify/polaris";
import { useContext } from "react";
import { ShopContext } from "../providers";

/**
 * This is where your main app logic should go
 *
 * To end the trial period, make use of your app's API Playgound. The button in the UI will bring you to the playground with data prefilled.
 *
 */
export default () => {
  const { shop, gadgetMetadata } = useContext(ShopContext);
  
  return (
    <Page title="Customer Credits Management">
      <Layout>
        <Layout.Section>
          <Card title="About This App">
            <Card.Section>
              <p>
                This app helps you manage customer credit discounts based on customer metafields. 
                You can define rules for converting customer credits into discount codes.
              </p>
            </Card.Section>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card title="How to Use">
            <Card.Section title="1. Set Up Credit Settings">
              <p>
                Go to the <strong>Credit Settings</strong> page to define rules for converting
                customer credits to discount codes. You'll need to specify:
              </p>
              <ul>
                <li>The metafield that stores customer credits</li>
                <li>The discount type and value to offer</li>
                <li>Minimum credits required</li>
              </ul>
            </Card.Section>
            
            <Card.Section title="2. Connect with make.com">
              <p>
                In your make.com workflow, use the following API endpoint to generate a discount code:
              </p>
              <pre style={{ background: "#f4f6f8", padding: "10px", overflowX: "auto" }}>
                {`POST ${process.env.GADGET_PUBLIC_APP_URL}/api/getDiscountCode
                
Body:
{
  "shopDomain": "your-shop.myshopify.com",
  "customerId": "123456789",
  "metafieldKey": "credits",
  "metafieldNamespace": "customer"
}
                `}
              </pre>
            </Card.Section>
            
            <Card.Section title="3. Apply the Discount">
              <p>
                The API will return a discount code that can be used by the customer at checkout.
                The discount value will be based on your settings, and the code will only work for 
                the specific customer.
              </p>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );

  return (
    <Page title="Next steps">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Test the monthly subscription logic
                </Text>
                <Text as="p" variant="bodyMd">
                  Change between plans by navigating to the Plans page. The page
                  should populate like it did on intial app installation. Note
                  that this template only supports non-zero plan prices. Shopify
                  requires that you give them a positive non-zero price when
                  creating an appSubscription record.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Manually end the trial
                </Text>
                <Text as="p" variant="bodyMd">
                  You may wish to see what the ShopPage component would look
                  like once the trial is completed. To do this run the following
                  mutation. This mutation will set the{" "}
                  <strong>usedTrialMinutes</strong> field equal to 7 days (in
                  minutes). Make sure to adjust the number if you have more
                  trial days.
                </Text>
                <Button
                  variant="primary"
                  onClick={() =>
                    open(
                      `${
                        gadgetMetadata?.gadgetMeta?.productionRenderURL
                      }api/playground/javascript?code=${encodeURIComponent(`await api.internal.shopifyShop.update("${shop?.id}", {
  // Make sure to change this 1440 * number of days on the trial
  usedTrialMinutes: 10080
})`)}&environment=${gadgetMetadata?.gadgetMeta?.environmentName?.toLowerCase()}`,
                      "_blank"
                    )
                  }
                >
                  Open API Playground
                </Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
