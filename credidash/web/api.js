import { Client } from "@gadget-client/credify";

export const api = new Client({ environment: window.gadgetConfig.environment });
