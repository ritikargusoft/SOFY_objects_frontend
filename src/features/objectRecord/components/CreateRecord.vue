<template>
  <v-dialog v-model="dialog" max-width="820">
    <v-card>
      <v-card-title> Create Record </v-card-title>
      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-row>
            <template v-for="f in fieldsToUse" :key="f.nameSan">
              <v-col :cols="f.colSpan">
                <component
                  :is="inputComponent(f)"
                  v-model="formValues[f.nameSan]"
                  :label="f.label || f.name"
                  :rows="3"
                  :type="f.inputType"
                  :items="f.selectOptions || []"
                  dense
                />
              </v-col>
            </template>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn color="blue-lighten-1" elevation="2" @click="submit"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { sanitizeIdentifier } from "../utils/sanitize.js";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  fields: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:show", "created", "error"]);

const store = useStore();
const dialog = ref(props.show);

watch(
  () => props.show,
  (v) => (dialog.value = v)
);
watch(dialog, (v) => emit("update:show", v));

const fieldsToUse = computed(() =>
  (props.fields || []).map((f) => {
    const nameSan = sanitizeIdentifier(f.name || f.field_uuid || "");
    return {
      ...f,
      nameSan,
      inputType: inputTypeFor(f.field_type),
      colSpan: 12,
    };
  })
);

// form values
const formValues = ref({});
watch(
  () => fieldsToUse.value,
  (list) => {
    const vals = {};
    list.forEach((f) => {
      vals[f.nameSan] = "";
      if (f.field_type === "checkbox") vals[f.nameSan] = false;
    });
    formValues.value = vals;
  },
  { immediate: true }
);

function inputTypeFor(fieldType) {
  switch (fieldType) {
    case "number":
      return "number";
    case "long_text":
      return "textarea";
    case "checkbox":
      return "checkbox";
    default:
      return "text";
  }
}
function inputComponent(f) {
  if (f.field_type === "long_text") return "v-textarea";
  if (f.field_type === "checkbox") return "v-checkbox";
  return "v-text-field";
}
function close() {
  dialog.value = false;
}

async function submit() {
  try {
    const payload = {};
    for (const key in formValues.value) {
      if (formValues.value[key] === undefined) continue;
      payload[key] = formValues.value[key];
    }

    const res = await store.dispatch("objectRecords/createRecord", {
      objectUuid: props.objectUuid,
      payload,
    });

    if (res) {
      emit("created", res);
      dialog.value = false;
      return;
    }
    emit("error", "Failed to create record");
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    emit("error", msg);
  }
}
</script>
