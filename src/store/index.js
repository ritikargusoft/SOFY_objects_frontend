import { createStore } from "vuex";
import objects from "./modules/objects.js";
import fields from "./modules/fields.js";
import objectRecords from "./modules/objectRecord.js";
export default createStore({
  modules: {
    objects,
    fields,
    objectRecords,
  },
});
