import { Database } from "@nozbe/watermelondb";

import { mySchema } from "./schema";
import Debtor from "../features/debtors/models/Debtor";
import InventoryItemModel from "../features/inventory/models/InventoryItem";
import { adapter } from "./adapter";

// Polyfill localStorage for Node environment (build time) to prevent expo-notifications crash
if (
  typeof localStorage === "undefined" ||
  typeof localStorage.getItem !== "function"
) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as any;
}

export const database = new Database({
  adapter,
  modelClasses: [Debtor, InventoryItemModel],
});
