import ObjectPage from "../features/objects/pages/ObjectPage.vue";
import ObjectDetail from "../features/fields/pages/ObjectDetail.vue";

export default [
  { path: "/objects", name: "Objects", component: ObjectPage },
  {
    path: "/objects/:id",
    name: "ObjectDetail",
    component: ObjectDetail,
    props: true,
  },
];
