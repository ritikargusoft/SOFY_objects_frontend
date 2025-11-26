<template>
  <v-dialog v-model="dialog" max-width="820">
    <v-card>
      <v-card-title>Update Record</v-card-title>
      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-row>
            <template v-for="f in fieldsToUse" :key="f.key">
              <v-col :cols="f.colSpan">
                <component
                  :is="inputComponent(f)"
                  v-model="formValues[f.key]"
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
        <v-btn color="blue-lighten-1" elevation="2" @click="submit">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  fields: { type: Array, default: () => [] },
  record: { type: Object, default: null },
});

const emit = defineEmits(["update:show", "updated", "error"]);
const store = useStore();

const dialog = ref(props.show);
watch(
  () => props.show,
  (v) => (dialog.value = v)
);
watch(dialog, (v) => emit("update:show", v));

const fieldsToUse = computed(() =>
  (props.fields || []).map((f) => {
    const key = f.name || f.field_name;
    return {
      ...f,
      key,
      inputType: inputTypeFor(f.field_type),
      colSpan: 12,
      selectOptions: f.options ?? null,
    };
  })
);

const formValues = ref({});
watch(
  () => [fieldsToUse.value, props.record],
  ([list, rec]) => {
    const vals = {};
    list.forEach((f) => {
      vals[f.key] = rec?.[f.key] ?? "";
      if (f.field_type === "checkbox") vals[f.key] = !!vals[f.key];
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
    case "email":
      return "email";
    case "date":
      return "date";
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

    if (!props.record?.record_uuid) {
      emit("error", "Record identifier missing");
      return;
    }

    const res = await store.dispatch("objectRecords/updateRecord", {
      objectUuid: props.objectUuid,
      recordUuid: props.record.record_uuid,
      payload,
    });

    if (res) {
      emit("updated", res);
      dialog.value = false;
      return;
    }
    emit("error", "Failed to update record");
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    emit("error", msg);
  }
}
</script>

<style scoped></style>
