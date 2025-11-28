<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title class="font-weight-bold">Update Field</v-card-title>
      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.field_name"
            label="Name"
            :rules="[required]"
            variant="outlined"
            hint='The characters .<>:"/|?*=!;`~% are not allowed.'
            class="mb-4"
            persistent-hint
          />
          <v-textarea
            v-model="form.field_label"
            label="Label"
            :rules="[required]"
            variant="outlined"
            rows="4"
          />
          <v-textarea
            v-model="form.field_description"
            label="Description"
            rows="2"
            variant="outlined"
          />
          <v-select
            v-model="form.field_type"
            :items="types"
            label="Type"
            :rules="[required]"
            variant="outlined"
            dense
            class="mb-4"
          />
          <!-- <v-text-field
            v-model="form.field_order"
            label="Order (optional)"
            type="number"
            variant="outlined"
            hide-details
          /> -->

          <div v-if="form.field_type === 'short_text'">
            <v-text-field
              v-model.number="form.max_length"
              type="number"
              label="Max length"
              variant="outlined"
              :error="!!maxLengthError"
              :error-messages="maxLengthError ? [maxLengthError] : []"
              hint="Max Length should not be greater than NVARCHAR(MAX) (i.e. 1000000000). Default is 200."
              persistent-hint
            />
            <v-text-field
              v-model="form.default_value"
              label="Default value"
              variant="outlined"
              :error="!!defaultValueError"
              :error-messages="defaultValueError ? [defaultValueError] : []"
            />
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          text
          @click="dialog = false"
          >Cancel</v-btn
        >
        <v-btn
          variant="tonal"
          class="bg-blue-darken-3"
          @click="submit"
          :disabled="!canSubmitField"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const VARCHAR_MAX_LIMIT = 1000000000;

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
  max_length: 200,
  default_value: "",
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
  "decimal",
];

const required = (v) => (v && v.toString().trim().length > 0) || "Required";

watch(
  () => props.show,
  (v) => {
    if (v && props.field) {
      form.value = {
        field_name: props.field.name ?? props.field.field_name ?? "",
        field_label: props.field.label ?? props.field.field_label ?? "",
        field_description:
          props.field.description ?? props.field.field_description ?? "",
        field_type: props.field.field_type ?? props.field.type ?? "",
        field_order: props.field.field_order ?? null,
        max_length:
          props.field.max_length ??
          (props.field.max_length === "short_text" ? 200 : null),
        default_value: props.field.default_value ?? "",
      };
    } else if (v) {
      form.value = {
        field_name: "",
        field_label: "",
        field_description: "",
        field_type: "",
        field_order: null,
        max_length: 200,
        default_value: "",
      };
    }
  },
  { immediate: true }
);

const maxLengthError = computed(() => {
  if (form.value.field_type !== "short_text") return "";
  const v = form.value.max_length;
  if (v === null || v === undefined || v === "") return "";
  const num = Number(v);
  if (Number.isNaN(num) || num <= 0)
    return "Max Length must be a positive number";
  if (num > VARCHAR_MAX_LIMIT)
    return `MAX Length should not be greater than ${VARCHAR_MAX_LIMIT}`;
  return "";
});

const defaultValueError = computed(() => {
  if (form.value.field_type !== "short_text") return "";
  const dv = form.value.default_value ?? "";
  const ml = form.value.max_length;
  if (!ml) return "";
  const num = Number(ml);
  if (Number.isNaN(num) || num <= 0) return "";
  if (String(dv).length > num)
    return `Default value length must not exceed max length (${num})`;
  return "";
});

const canSubmitField = computed(() => {
  if (!form.value.field_name?.trim()) return false;
  if (!form.value.field_label?.trim()) return false;
  if (!form.value.field_type?.trim()) return false;
  if (maxLengthError.value) return false;
  if (defaultValueError.value) return false;
  return true;
});
async function submit() {
  if (!canSubmitField.value) {
    const msg =
      "Field name, label and type are required, and max length must be valid";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  if (!props.field?.field_uuid) {
    const msg = "Field identifier missing";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  const payload = {
    name: form.value.field_name.trim(),
    label: form.value.field_label.trim(),
    description: form.value.field_description?.trim() ?? null,
    field_type: form.value.field_type,
    field_order: form.value.field_order ?? undefined,
  };

  if (form.value.field_type === "short_text") {
    const ml = form.value.max_length;
    payload.max_length = ml ? Number(ml) : 200;
  }

  // always include default_value field (empty string acceptable)
  payload.default_value = form.value.default_value ?? "";

  try {
    const res = await store.dispatch("fields/updateField", {
      objectUuid: props.objectUuid,
      fieldUuid: props.field.field_uuid,
      payload,
    });

    const data = res?.data ?? {};

    if (data?.result && data.result.updated === false) {
      const msg =
        data.message ??
        data.result.message ??
        "Field not updated (possibly duplicate name)";
      toast.error(msg);
      emit("error", msg);
      return;
    }

    if (data?.updated === true) {
      toast.success("Field updated successfully");
      emit("updated", data);
      dialog.value = false;
      return;
    }

    const msg = data.message ?? "Unexpected response from server";
    toast.error(msg);
    emit("error", msg);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    toast.error(msg);
    emit("error", msg);
  }
}
</script>

<style scoped></style>
