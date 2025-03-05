import {
  AppType,
  Provider as GadgetProvider,
  useGadget,
} from "@gadgetinc/react-shopify-app-bridge";
import { NavMenu } from "@shopify/app-bridge-react";
import { Page, Text, Spinner } from "@shopify/polaris";
import { useEffect } from "react";
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import BillingPage from "../routes/billing";
import Index from "../routes/index";
import { api } from "../api";
import { ShopProvider } from "../providers";

function Error404() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      process.env.GADGET_PUBLIC_SHOPIFY_APP_URL &&
      location.pathname ===
        new URL(process.env.GADGET_PUBLIC_SHOPIFY_APP_URL).pathname
    )
      return navigate("/", { replace: true });
  }, [location.pathname]);

  return <div>404 not found</div>;
}

export default () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route path="/" index element={<Index />} />
        <Route path="/plans" element={<BillingPage />} />
        <Route path="/credit-settings" element={<CreditSettingsPage />} /> {/* Added route for credit settings */}
        <Route path="*" element={<Error404 />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

function Layout() {
  const { isAuthenticated, isLoading } = useGadget();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Spinner accessibilityLabel="Loading..." size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Text>Not authenticated</Text>;
  }

  return (
    <ShopProvider>
      <NavMenu
        navigationLinks={[
          {
            label: "Home",
            destination: "/",
          },
          {
            label: "Credit Settings",
            destination: "/credit-settings",
          },
          {
            label: "Plans",
            destination: "/plans",
          },
        ]}
        matcher={(link) => link.destination === location.pathname}
      />
      <Outlet />
    </ShopProvider>
  );
}

function AuthenticatedApp() {
  // we use `isAuthenticated` to render pages once the OAuth flow is complete!
  const { isAuthenticated, loading } = useGadget();
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    );
  }
  return isAuthenticated ? <EmbeddedApp /> : <UnauthenticatedApp />;
}

function EmbeddedApp() {
  return (
    <ShopProvider>
      <Outlet />
      
    </ShopProvider>
  );
}

function UnauthenticatedApp() {
  return (
    <Page title="App">
      <Text variant="bodyMd" as="p">
        App can only be viewed in the Shopify Admin.
      </Text>
    </Page>
  );
}

// Placeholder for CreditSettingsPage component.  Replace with actual implementation.
function CreditSettingsPage() {
  return (
    <Page title="Credit Settings">
      <Text>Credit Settings Page Content</Text>
    </Page>
  );
}