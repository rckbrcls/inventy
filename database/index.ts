import { Database } from "@nozbe/watermelondb";

import { mySchema } from "./schema";
import Debtor from "../features/debtors/models/Debtor";
import InventoryItemModel from "../features/inventory/models/InventoryItem";
import { adapter } from "./adapter";

export const database = new Database({
  adapter,
  modelClasses: [Debtor, InventoryItemModel],
});
