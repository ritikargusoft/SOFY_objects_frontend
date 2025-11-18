
import { createStore } from "vuex";
import objects from "./modules/objects.js";
import fields from "./modules/fields.js";
export default createStore({
  modules: {
    objects,
    fields
  }
});