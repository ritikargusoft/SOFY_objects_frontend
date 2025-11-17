<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Add Field</v-card-title>

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
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="blue-lighten-1" @click="submit">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import fieldService from "../api/fieldService.js";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
});
const emit = defineEmits(["update:show", "created", "error"]);

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
    if (v) {
      form.value = {
        field_name: "",
        field_label: "",
        field_description: "",
        field_type: "",
        field_order: null,
      };
    }
  }
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

  try {
    const payload = {
      field_name: form.value.field_name.trim(),
      field_label: form.value.field_label.trim(),
      field_description: form.value.field_description?.trim() ?? null,
      field_type: form.value.field_type,
      field_order: form.value.field_order ?? undefined,
    };
    const res = await fieldService.createField(props.objectUuid, payload);
    if (res.status === 201) {
      emit("created", res.data);
      dialog.value = false;
    } else if (res.status === 200) {
      emit("error", res.data?.message ?? "Field already exists");
    } else {
      emit("error", "Unexpected response from server");
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    emit("error", msg);
  }
}
</script>
