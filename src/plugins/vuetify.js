import { createVuetify } from "vuetify";
import "vuetify/styles";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "../assets/styles/themes.scss";  
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "objectsTheme",
    themes: {
      objectsTheme: {
        dark: false,
        colors: {
          background: "var(--background)", 
          surface: "var(--background2)",
          primary: "var(--primary)",
          secondary: "var(--secondary)",
          error: "var(--error)",
          success: "var(--success)",
          info: "var(--info)",
          warning: "var(--warning)",
          
        },
      },
    },
  },
});

export default vuetify;
