<template>
  <v-dialog v-model="dialog" max-width="820">
    <v-card class="px-1 py-5">
      <v-card-title class="font-weight-bold">Update Record</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" lazy-validation>
          <v-row>
            <template v-for="f in fieldsToUse" :key="f.key">
              <v-col :cols="f.colSpan || 12">
                <component
                  :is="inputComponent(f)"
                  v-model="formValues[f.key]"
                  :label="f.label || f.name"
                  :rows="f.inputType === 'textarea' ? f.rows || 3 : undefined"
                  :type="
                    f.inputType === 'number'
                      ? 'number'
                      : f.inputType === 'email'
                      ? 'email'
                      : 'text'
                  "
                  :items="f.selectOptions || []"
                  dense
                  variant="outlined"
                  clearable
                  :multiple="f.inputType === 'multi_select'"
                  :error="(fieldErrors[f.key] || []).length > 0"
                  :error-messages="fieldErrors[f.key] || []"
                  :maxlength="
                    f.inputType === 'text' && f.maxLength
                      ? f.maxLength
                      : undefined
                  "
                />
              </v-col>
            </template>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          text
          @click="close"
          :disabled="submitting"
        >
          Cancel
        </v-btn>

        <v-btn
          :loading="submitting"
          :disabled="!canSubmit || submitting"
          variant="tonal"
          class="bg-blue-darken-3"
          elevation="2"
          @click="submit"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  fields: { type: Array, default: () => [] },
  record: { type: Object, default: null },
});

const emit = defineEmits(["update:show", "updated", "error"]);
const store = useStore();

const dialog = ref(props.show);
const formRef = ref(null);
const valid = ref(true);
const submitting = ref(false);

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
      colSpan: f.colSpan || 12,
      rows: f.rows || 3,
      selectOptions: f.selectOptions || f.options || [],
      required: !!f.required,
      maxLength: f.max_length || null,
      defaultValue: f.default_value ?? null,
    };
  })
);

const formValues = ref({});
const initialFormValues = ref({});

watch(
  () => [fieldsToUse.value, props.record],
  ([list, rec]) => {
    const vals = {};
    list.forEach((f) => {
      const raw = rec?.[f.key];
      if (f.field_type === "checkbox") {
        vals[f.key] = typeof raw !== "undefined" && raw !== null ? raw : false;
      } else if (f.inputType === "multi_select") {
        vals[f.key] = typeof raw !== "undefined" && raw !== null ? raw : [];
      } else if (f.inputType === "number") {
        vals[f.key] = typeof raw !== "undefined" && raw !== null ? raw : 0;
      } else {
        vals[f.key] = typeof raw !== "undefined" && raw !== null ? raw : "";
      }
    });
    formValues.value = vals;
    initialFormValues.value = JSON.parse(JSON.stringify(vals));
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
    case "dropdown":
      return "select";
    case "radio":
      return "select";
    case "multi_select":
      return "multi_select";
    case "star_rating":
      return "rating";
    default:
      return "text";
  }
}

function inputComponent(f) {
  if (f.field_type === "long_text") return "v-textarea";
  if (f.field_type === "checkbox") return "v-checkbox";
  if (f.field_type === "star_rating") return "v-rating";
  if (
    f.field_type === "dropdown" ||
    f.field_type === "radio" ||
    f.field_type === "multi_select"
  )
    return "v-select";
  return "v-text-field";
}

function rulesFor(f) {
  const rules = [];

  if (f.field_type === "email") {
    rules.push((v) => {
      if (v === "" || v === null || v === undefined) return true;
      const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return r.test(v) || "Invalid email";
    });
  }

  if (f.field_type === "number") {
    rules.push((v) => {
      if (v === "" || v === null || v === undefined) return true;
      return !Number.isNaN(Number(v)) || "Must be a number";
    });
  }

  if (f.field_type === "short_text" && f.maxLength) {
    rules.push((v) => {
      if (v === "" || v === null || v === undefined) return true;
      return (
        String(v).length <= f.maxLength ||
        `Must be at most ${f.maxLength} characters`
      );
    });
  }

  return rules;
}

const fieldErrors = computed(() => {
  const errors = {};
  const list = fieldsToUse.value || [];
  for (const f of list) {
    const rules = rulesFor(f);
    const val = formValues.value?.[f.key];
    const msgs = [];
    for (const r of rules) {
      try {
        const out = r(val);
        if (out !== true) msgs.push(out);
      } catch (e) {
        msgs.push(String(e));
      }
    }
    if (msgs.length > 0) errors[f.key] = msgs;
  }
  return errors;
});

function atLeastOneFilled() {
  const vals = formValues.value || {};
  for (const key in vals) {
    const v = vals[key];
    if (v === null || v === undefined) continue;
    if (typeof v === "boolean") {
      if (v === true) return true;
      continue;
    }
    if (Array.isArray(v)) {
      if (v.length > 0) return true;
      continue;
    }
    if (typeof v === "object") {
      if (Object.keys(v).length > 0) return true;
      continue;
    }
    if (typeof v === "number") {
      if (!Number.isNaN(v)) return true;
    }
    if (typeof v === "string") {
      if (v.trim().length > 0) return true;
      if (!isNaN(Number(v)) && String(v).trim() !== "") return true;
    }
  }
  return false;
}

const hasNonNumberFields = computed(() =>
  (fieldsToUse.value || []).some((f) => f.inputType !== "number")
);
const hasFieldValidationErrors = computed(
  () => Object.keys(fieldErrors.value || {}).length > 0
);

const canSubmit = computed(() => {
  if (hasFieldValidationErrors.value) return false;
  if (hasNonNumberFields.value) return atLeastOneFilled();
  return true;
});

function close() {
  dialog.value = false;
}

async function submit() {
  const form = formRef.value;
  if (form && typeof form.validate === "function") {
    const ok = await form.validate();
    if (!ok) {
      toast.error("Please fix validation errors");
      return;
    }
  }

  if (!canSubmit.value) {
    toast.error("Please fill at least one field before saving");
    return;
  }

  try {
    submitting.value = true;
    const payload = {};
    for (const key in formValues.value) {
      const val = formValues.value[key];
      const initial = initialFormValues.value?.[key];
      if (val === undefined) continue;

      if (Array.isArray(val)) {
        const changed = JSON.stringify(val) !== JSON.stringify(initial);
        if (changed) payload[key] = val;
        else if (val.length > 0) payload[key] = val;
        continue;
      }

      if (typeof val === "boolean" || typeof val === "number") {
        payload[key] = val;
        continue;
      }

      if (typeof val === "string") {
        const changed = String(val) !== String(initial);
        if (changed) {
          // if user cleared field (""), include empty string in payload
          payload[key] = val;
          continue;
        }
        // unchanged and non-empty -> include
        if (val.trim() !== "") {
          payload[key] = val;
          continue;
        }
        // unchanged and empty -> skip
        continue;
      }

      if (val !== null && val !== undefined) payload[key] = val;
    }

    if (!props.record?.record_uuid) {
      const msg = "Record identifier missing";
      toast.error(msg);
      emit("error", msg);
      submitting.value = false;
      return;
    }

    const res = await store.dispatch("objectRecords/updateRecord", {
      objectUuid: props.objectUuid,
      recordUuid: props.record.record_uuid,
      payload,
    });

    if (res) {
      toast.success("Record updated successfully");
      emit("updated", res);
      dialog.value = false;
      submitting.value = false;
      return;
    }

    const msg = "Failed to update record";
    toast.error(msg);
    emit("error", msg);
    submitting.value = false;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    toast.error(msg);
    emit("error", msg);
    submitting.value = false;
  }
}
</script>
