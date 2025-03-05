
import {
  Page,
  Layout,
  Card,
  Button,
  ResourceList,
  ResourceItem,
  TextStyle,
  Stack,
  Badge,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
  Checkbox
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { api } from "../api";
import { useContext } from "react";
import { ShopContext } from "../providers";

export default () => {
  const { shop } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    metafieldKey: "",
    metafieldNamespace: "customer",
    discountType: "percentage",
    discountValue: "",
    minimumCreditRequired: "1",
    discountCodePrefix: "",
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const discountTypeOptions = [
    { label: "Percentage", value: "percentage" },
    { label: "Fixed Amount", value: "fixed_amount" }
  ];

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.creditSetting.findMany({
        where: { shop: { equals: shop?.id } }
      });
      setSettings(data);
    } catch (error) {
      console.error("Error fetching credit settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    if (shop?.id) {
      fetchSettings();
    }
  }, [shop?.id, fetchSettings]);

  const handleModalClose = useCallback(() => {
    setModalActive(false);
    setFormValues({
      name: "",
      metafieldKey: "",
      metafieldNamespace: "customer",
      discountType: "percentage",
      discountValue: "",
      minimumCreditRequired: "1",
      discountCodePrefix: "",
      isActive: true
    });
    setIsEditing(false);
    setCurrentId(null);
  }, []);

  const handleModalOpen = useCallback(() => {
    setModalActive(true);
  }, []);

  const handleEditClick = useCallback((setting) => {
    setFormValues({
      name: setting.name,
      metafieldKey: setting.metafieldKey,
      metafieldNamespace: setting.metafieldNamespace,
      discountType: setting.discountType,
      discountValue: setting.discountValue.toString(),
      minimumCreditRequired: setting.minimumCreditRequired.toString(),
      discountCodePrefix: setting.discountCodePrefix || "",
      isActive: setting.isActive
    });
    setIsEditing(true);
    setCurrentId(setting.id);
    setModalActive(true);
  }, []);

  const handleDeleteClick = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      try {
        await api.creditSetting.delete(id);
        fetchSettings();
      } catch (error) {
        console.error("Error deleting credit setting:", error);
      }
    }
  }, [fetchSettings]);

  const handleFormSubmit = useCallback(async () => {
    try {
      const formData = {
        ...formValues,
        discountValue: Number(formValues.discountValue),
        minimumCreditRequired: Number(formValues.minimumCreditRequired),
        shop: { connect: shop.id }
      };

      if (isEditing && currentId) {
        await api.creditSetting.update(currentId, formData);
      } else {
        await api.creditSetting.create(formData);
      }
      
      handleModalClose();
      fetchSettings();
    } catch (error) {
      console.error("Error saving credit setting:", error);
    }
  }, [formValues, isEditing, currentId, shop?.id, handleModalClose, fetchSettings]);

  const handleFormChange = useCallback((field) => (value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Page
      title="Credit Settings"
      primaryAction={{
        content: "Add Setting",
        onAction: handleModalOpen
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              loading={isLoading}
              emptyState={
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <TextStyle variation="subdued">No credit settings found. Click "Add Setting" to create one.</TextStyle>
                </div>
              }
              items={settings}
              renderItem={(item) => (
                <ResourceItem
                  id={item.id}
                  accessibilityLabel={`View details for ${item.name}`}
                >
                  <Stack>
                    <Stack.Item fill>
                      <h3>
                        <TextStyle variation="strong">{item.name}</TextStyle>
                      </h3>
                      <div>Metafield: {item.metafieldNamespace}.{item.metafieldKey}</div>
                      <div>Discount: {item.discountType === "percentage" ? `${item.discountValue}%` : `$${item.discountValue}`}</div>
                      <div>Min. Credit: {item.minimumCreditRequired}</div>
                    </Stack.Item>
                    <Stack.Item>
                      <Stack vertical spacing="tight">
                        <Badge status={item.isActive ? "success" : "critical"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Stack spacing="tight">
                          <Button size="slim" onClick={() => handleEditClick(item)}>Edit</Button>
                          <Button size="slim" destructive onClick={() => handleDeleteClick(item.id)}>Delete</Button>
                        </Stack>
                      </Stack>
                    </Stack.Item>
                  </Stack>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalActive}
        onClose={handleModalClose}
        title={isEditing ? "Edit Credit Setting" : "Add Credit Setting"}
        primaryAction={{
          content: "Save",
          onAction: handleFormSubmit
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleModalClose
          }
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleFormSubmit}>
            <FormLayout>
              <TextField
                label="Name"
                value={formValues.name}
                onChange={handleFormChange("name")}
                required
              />
              
              <FormLayout.Group>
                <TextField
                  label="Metafield Namespace"
                  value={formValues.metafieldNamespace}
                  onChange={handleFormChange("metafieldNamespace")}
                  required
                  helpText="Usually 'customer'"
                />
                <TextField
                  label="Metafield Key"
                  value={formValues.metafieldKey}
                  onChange={handleFormChange("metafieldKey")}
                  required
                  helpText="e.g. 'credits'"
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <Select
                  label="Discount Type"
                  options={discountTypeOptions}
                  value={formValues.discountType}
                  onChange={handleFormChange("discountType")}
                  required
                />
                <TextField
                  label="Discount Value"
                  value={formValues.discountValue}
                  onChange={handleFormChange("discountValue")}
                  type="number"
                  required
                  helpText={formValues.discountType === "percentage" ? "Percentage (0-100)" : "Fixed amount"}
                />
              </FormLayout.Group>

              <TextField
                label="Minimum Credit Required"
                value={formValues.minimumCreditRequired}
                onChange={handleFormChange("minimumCreditRequired")}
                type="number"
                required
                min="1"
                helpText="Minimum credit needed to generate a discount"
              />

              <TextField
                label="Discount Code Prefix"
                value={formValues.discountCodePrefix}
                onChange={handleFormChange("discountCodePrefix")}
                helpText="Optional prefix for generated discount codes. Default: 'CREDIT'"
              />

              <Checkbox
                label="Active"
                checked={formValues.isActive}
                onChange={handleFormChange("isActive")}
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
};
