<template>
  <v-dialog v-model="dialog" max-width="820">
    <v-card class="px-1 py-5">
      <v-card-title class="font-weight-bold"> Create Record </v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="valid" lazy-validation>
          <v-row>
            <template v-for="f in fieldsToUse" :key="f.key">
              <v-col :cols="f.colSpan || 12">
                <component
                  v-if="!isRichLongText(f)"
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
                    (f.inputType === 'text' || f.inputType === 'textarea') &&
                    f.maxLength
                      ? f.maxLength
                      : undefined
                  "
                />
                <div v-else>
                  <div class="mb-2">{{ f.label || f.name }}</div>
                  <RichTextEditor v-model="formValues[f.key]" />
                  <div
                    v-if="fieldErrors[f.key]?.length"
                    class="text-caption red--text"
                  >
                    {{ fieldErrors[f.key].join(", ") }}
                  </div>
                </div>
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
          >Cancel</v-btn
        >

        <v-btn
          :loading="submitting"
          :disabled="!canSubmit || submitting"
          variant="tonal"
          class="bg-blue-darken-3"
          elevation="2"
          @click="submit"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import RichTextEditor from "../../objects/components/RichTextEditor.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  fields: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:show", "created", "error"]);

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
      defaultValue:
        typeof f.default_value !== "undefined" ? f.default_value : null,
      markdown: !!f.markdown,
      min_value: typeof f.min_value !== "undefined" ? f.min_value : null,
      max_value: typeof f.max_value !== "undefined" ? f.max_value : null,
      allow_decimal: !!f.allow_decimal,
      decimal_places:
        typeof f.decimal_places !== "undefined" && f.decimal_places !== null
          ? f.decimal_places
          : 3,
    };
  })
);

const formValues = ref({});
const initialFormValues = ref({});
watch(
  () => fieldsToUse.value,
  (list) => {
    const vals = {};
    list.forEach((f) => {
      if (f.field_type === "checkbox") {
        vals[f.key] =
          typeof f.defaultValue !== "undefined" && f.defaultValue !== null
            ? f.defaultValue
            : false;
      } else if (f.inputType === "multi_select") {
        vals[f.key] = f.defaultValue || [];
      } else if (f.inputType === "number") {
        if (
          typeof f.defaultValue !== "undefined" &&
          f.defaultValue !== null &&
          f.defaultValue !== ""
        ) {
          vals[f.key] = f.defaultValue;
        } else {
          if (f.allow_decimal) {
            vals[f.key] = Number(0).toFixed(Number(f.decimal_places ?? 3));
          } else {
            vals[f.key] = 0;
          }
        }
      } else {
        vals[f.key] =
          typeof f.defaultValue !== "undefined" && f.defaultValue !== null
            ? f.defaultValue
            : "";
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
    case "checkbox":
      return "checkbox";
    case "dropdown":
      return "select";
    case "radio":
      return "select";
    case "multi_select":
      return "multi_select";
    case "email":
      return "email";
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

function isRichLongText(f) {
  return f.field_type === "long_text" && f.markdown === true;
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

    rules.push((v) => {
      if (v === "" || v === null || v === undefined) return true;
      if (
        f.min_value !== null &&
        f.min_value !== "" &&
        Number(v) < Number(f.min_value)
      )
        return `Must be >= ${f.min_value}`;
      if (
        f.max_value !== null &&
        f.max_value !== "" &&
        Number(v) > Number(f.max_value)
      )
        return `Must be <= ${f.max_value}`;
      return true;
    });

    rules.push((v) => {
      if (v === "" || v === null || v === undefined) return true;
      if (!f.allow_decimal) {
        if (String(v).includes(".")) return "Decimals are not allowed";
        return true;
      }
      const dp = Number(f.decimal_places ?? 3);
      const parts = String(v).split(".");
      const decimals = (parts[1] || "").length;
      if (decimals > dp) return `Max ${dp} decimal places allowed`;
      return true;
    });
  }

  if (
    (f.field_type === "short_text" || f.field_type === "long_text") &&
    f.maxLength
  ) {
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
  try {
    if (hasFieldValidationErrors.value) {
      toast.error("Please fix validation errors");
      return;
    }

    if (!canSubmit.value) {
      toast.error("Please fill at least one field before creating the record");
      return;
    }

    submitting.value = true;
    const payload = {};
    for (const key in formValues.value) {
      const val = formValues.value[key];
      const initial = initialFormValues.value?.[key];

      if (val === undefined) continue;

      if (Array.isArray(val)) {
        if (val.length === 0) {
          const changed = JSON.stringify(val) !== JSON.stringify(initial);
          if (changed) payload[key] = val;
        } else {
          payload[key] = val;
        }
        continue;
      }

      if (typeof val === "boolean" || typeof val === "number") {
        payload[key] = val;
        continue;
      }

      if (typeof val === "string") {
        const changed = String(val) !== String(initial);
        if (changed) {
          payload[key] = convertIfNumberField(key, val);
          continue;
        }
        if (val.trim() !== "") {
          payload[key] = convertIfNumberField(key, val);
          continue;
        }
        continue;
      }

      if (val !== null && val !== undefined) payload[key] = val;
    }

    const res = await store.dispatch("objectRecords/createRecord", {
      objectUuid: props.objectUuid,
      payload,
    });

    if (res) {
      toast.success("Record created successfully");
      emit("created", res);
      dialog.value = false;
      submitting.value = false;
      return;
    }
    const msg = "Failed to create record";
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

function convertIfNumberField(key, value) {
  const f = (fieldsToUse.value || []).find((x) => x.key === key);
  if (!f) return value;
  if (f.inputType !== "number") return value;
  if (value === "" || value === null || typeof value === "undefined")
    return value;
  const num = Number(value);
  return Number.isNaN(num) ? value : num;
}
</script>
