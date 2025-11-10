import { createVuetify } from "vuetify";
import "vuetify/styles";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "../assets/styles/themes.scss";  
const vuetify = createVuetify({
  components,
  directives,
 
});

export default vuetify;
