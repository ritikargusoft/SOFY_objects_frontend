<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Update Field</v-card-title>
      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.field_name"
            label="Field name (identifier)"
            :rules="[required]"
            hint="No spaces/special chars recommended; will be sanitized by backend"
            persistent-hint
          />
          <v-text-field
            v-model="form.field_label"
            label="Field label (display name)"
            :rules="[required]"
          />
          <v-textarea
            v-model="form.field_description"
            label="Description (optional)"
            rows="2"
          />
          <v-select
            v-model="form.field_type"
            :items="types"
            label="Type"
            :rules="[required]"
            dense
          />
          <v-text-field
            v-model="form.field_order"
            label="Order (optional)"
            type="number"
            hide-details
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="blue-lighten-1" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  field: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "updated", "error"]);
const store = useStore();
const dialog = computed({
  get: () => props.show,
  set: (v) => emit("update:show", v),
});
const formRef = ref(null);
const form = ref({
  field_name: "",
  field_label: "",
  field_description: "",
  field_type: "",
  field_order: null,
});
const types = [
  "short_text",
  "long_text",
  "number",
  "checkbox",
  "dropdown",
  "radio",
  "email",
  "star_rating",
];
const required = (v) => (v && v.toString().trim().length > 0) || "Required";
watch(
  () => props.show,
  (v) => {
    if (v && props.field) {
      form.value = {
        field_name: props.field.name ?? "",
        field_label: props.field.label ?? "",
        field_description: props.field.description ?? "",
        field_type: props.field.field_type ?? props.field.type ?? "",
        field_order: props.field.field_order ?? null,
      };
    } else if (v) {
      form.value = {
        field_name: "",
        field_label: "",
        field_description: "",
        field_type: "",
        field_order: null,
      };
    }
  },
  { immediate: true }
);
async function submit() {
  if (
    !required(form.value.field_name) ||
    !required(form.value.field_label) ||
    !required(form.value.field_type)
  ) {
    emit("error", "Please fill required fields");
    return;
  }
  const payload = {
    name: form.value.field_name.trim(),
    label: form.value.field_label.trim(),
    description: form.value.field_description?.trim() ?? null,
    field_type: form.value.field_type,
    field_order: form.value.field_order ?? undefined,
  };
  try {
    const res = await store.dispatch("fields/updateField", {
      objectUuid: props.objectUuid,
      fieldUuid: props.field.field_uuid,
      payload,
    });
    if (res.status === 200) {
      emit("updated", res.data);
      dialog.value = false;
    } else {
      emit("error", res.data?.message ?? "Unexpected response from server");
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    emit("error", msg);
  }
}
</script>
<style scoped></style>