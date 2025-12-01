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

          <div
            v-if="
              form.field_type === 'short_text' ||
              form.field_type === 'long_text' ||
              form.field_type === 'number'
            "
          >
            <div
              v-if="
                form.field_type === 'short_text' ||
                form.field_type === 'long_text'
              "
            >
              <v-text-field
                v-model.number="form.max_length"
                type="number"
                label="Max length"
                variant="outlined"
                :error="!!maxLengthError"
                :error-messages="maxLengthError ? [maxLengthError] : []"
                hint="Max Length should not be greater than 1000000000"
              />
            </div>

            <div v-if="form.field_type === 'long_text'" class="my-3">
              <label class="text-body-2 mb-2 d-block"
                >Enable Markdown Editor</label
              >

              <v-radio-group
                v-model="form.markdown"
                row
                hide-details
                density="comfortable"
                class="d-flex align-center"
              >
                <v-radio :value="true">
                  <template #label>
                    <span class="material-symbols-outlined icon-radio mr-1">
                      {{
                        form.markdown === true
                          ? "radio_button_checked"
                          : "radio_button_unchecked"
                      }}
                    </span>
                    Yes
                  </template>
                </v-radio>

                <v-radio :value="false">
                  <template #label>
                    <span class="material-symbols-outlined icon-radio mr-1">
                      {{
                        form.markdown === false
                          ? "radio_button_checked"
                          : "radio_button_unchecked"
                      }}
                    </span>
                    No
                  </template>
                </v-radio>
              </v-radio-group>
            </div>

            <div v-if="form.field_type === 'short_text'">
              <v-text-field
                v-model="form.default_value"
                label="Default value"
                variant="outlined"
                :error="!!defaultValueError"
                :error-messages="defaultValueError ? [defaultValueError] : []"
              />
            </div>

            <div v-else-if="form.field_type === 'long_text'">
              <div v-if="form.markdown">
                <div class="mb-2">Default value</div>
                <RichTextEditor v-model="form.default_value" />
                <div
                  v-if="defaultValueError"
                  class="text-caption red--text mt-2"
                >
                  {{ defaultValueError }}
                </div>
              </div>
              <div v-else>
                <v-textarea
                  v-model="form.default_value"
                  label="Default value (plain text)"
                  variant="outlined"
                  :error="!!defaultValueError"
                  :error-messages="defaultValueError ? [defaultValueError] : []"
                  rows="3"
                />
              </div>
            </div>

            <div v-else-if="form.field_type === 'number'">
              <v-text-field
                v-model="form.min_value"
                label="Min"
                variant="outlined"
                type="number"
                :error="!!minMaxError"
                :error-messages="minMaxError ? [minMaxError] : []"
              />

              <v-text-field
                v-model="form.max_value"
                label="Max"
                variant="outlined"
                type="number"
                :error="!!minMaxError"
                :error-messages="minMaxError ? [minMaxError] : []"
              />

              <div class="d-flex flex-column w-100 gap-4 mb-2">
                <div class="d-flex align-center justify-start">
                  <v-switch class="mt-5" v-model="form.allow_decimal" />
                  <label class="ml-3">Allow Decimals?</label>
                </div>

                <v-text-field
                  v-if="form.allow_decimal"
                  v-model.number="form.decimal_places"
                  type="number"
                  label="Decimal places"
                  variant="outlined"
                  class="w-100"
                  :error="!!decimalPlacesError"
                  :error-messages="
                    decimalPlacesError ? [decimalPlacesError] : []
                  "
                  style="width: 150px"
                />
              </div>

              <v-text-field
                v-model="form.default_value"
                label="Default value"
                variant="outlined"
                type="number"
                :error="!!defaultValueError"
                :error-messages="defaultValueError ? [defaultValueError] : []"
              />
            </div>
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
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import RichTextEditor from "../../objects/components/RichTextEditor.vue";

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
  markdown: false,
  min_value: null,
  max_value: null,
  allow_decimal: false,
  decimal_places: 3,
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
          (props.field.field_type === "short_text" ? 200 : null),
        default_value:
          typeof props.field.default_value !== "undefined" &&
          props.field.default_value !== null
            ? props.field.default_value
            : "",
        markdown: !!props.field.markdown,
        min_value:
          typeof props.field.min_value !== "undefined"
            ? props.field.min_value
            : null,
        max_value:
          typeof props.field.max_value !== "undefined"
            ? props.field.max_value
            : null,
        allow_decimal: !!props.field.allow_decimal,
        decimal_places:
          typeof props.field.decimal_places !== "undefined" &&
          props.field.decimal_places !== null
            ? props.field.decimal_places
            : 3,
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
        markdown: false,
        min_value: null,
        max_value: null,
        allow_decimal: false,
        decimal_places: 3,
      };
    }
  },
  { immediate: true }
);

const maxLengthError = computed(() => {
  if (
    form.value.field_type !== "short_text" &&
    form.value.field_type !== "long_text"
  )
    return "";
  const v = form.value.max_length;
  if (v === null || v === undefined || v === "") return "";
  const num = Number(v);
  if (Number.isNaN(num) || num <= 0)
    return "Max Length must be a positive number";
  if (num > VARCHAR_MAX_LIMIT)
    return `Max Length should not be greater than ${VARCHAR_MAX_LIMIT}`;
  return "";
});

const minMaxError = computed(() => {
  if (form.value.field_type !== "number") return "";
  const min = form.value.min_value;
  const max = form.value.max_value;
  if (
    (min === null || min === "" || typeof min === "undefined") &&
    (max === null || max === "" || typeof max === "undefined")
  )
    return "";
  if (min !== null && min !== "" && Number.isNaN(Number(min)))
    return "Min must be numeric";
  if (max !== null && max !== "" && Number.isNaN(Number(max)))
    return "Max must be numeric";
  if (
    min !== null &&
    min !== "" &&
    max !== null &&
    max !== "" &&
    !(Number(min) < Number(max))
  )
    return "Lowest Score must be less than Highest Score";
  return "";
});

const decimalPlacesError = computed(() => {
  if (form.value.field_type !== "number") return "";
  if (!form.value.allow_decimal) return "";
  const dp = form.value.decimal_places;
  if (dp === null || dp === undefined || dp === "") return "";
  if (!Number.isInteger(Number(dp))) return "Decimal places must be an integer";
  const ndi = Number(dp);
  if (ndi < 0 || ndi > 10) return "Decimal places must be between 0 and 10";
  return "";
});

const defaultValueError = computed(() => {
  // text default length
  if (
    form.value.field_type === "short_text" ||
    form.value.field_type === "long_text"
  ) {
    const dv = form.value.default_value ?? "";
    const ml = form.value.max_length;
    if (!ml) return "";
    const num = Number(ml);
    if (Number.isNaN(num) || num <= 0) return "";
    const textLength = typeof dv === "string" ? dv.length : 0;
    if (textLength > num)
      return `Default value length must not exceed max length (${num})`;
    return "";
  }

  // number default
  if (form.value.field_type === "number") {
    const dv = form.value.default_value;
    if (dv === null || dv === "" || typeof dv === "undefined") return "";
    if (Number.isNaN(Number(dv)))
      return "Default numeric value must be a number";
    if (
      form.value.min_value !== null &&
      form.value.min_value !== "" &&
      Number(dv) < Number(form.value.min_value)
    )
      return "Default must be >= minimum";
    if (
      form.value.max_value !== null &&
      form.value.max_value !== "" &&
      Number(dv) > Number(form.value.max_value)
    )
      return "Default must be <= maximum";
    if (
      form.value.allow_decimal &&
      typeof form.value.decimal_places !== "undefined" &&
      form.value.decimal_places !== null
    ) {
      const parts = String(dv).split(".");
      const decimals = (parts[1] || "").length;
      if (decimals > Number(form.value.decimal_places))
        return `Default value has more than ${form.value.decimal_places} decimal places`;
    } else {
      if (!form.value.allow_decimal && String(dv).includes("."))
        return "Decimals are not allowed for this field";
    }
    return "";
  }

  return "";
});

const canSubmitField = computed(() => {
  if (!form.value.field_name?.trim()) return false;
  if (!form.value.field_label?.trim()) return false;
  if (!form.value.field_type?.trim()) return false;
  if (maxLengthError.value) return false;
  if (minMaxError.value) return false;
  if (decimalPlacesError.value) return false;
  if (defaultValueError.value) return false;
  return true;
});

async function submit() {
  if (!canSubmitField.value) {
    const msg = "Field name, label and type are required";
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

  if (
    form.value.field_type === "short_text" ||
    form.value.field_type === "long_text"
  ) {
    const ml = form.value.max_length;
    payload.max_length = ml
      ? Number(ml)
      : form.value.field_type === "short_text"
      ? 255
      : null;
  }

  payload.default_value = form.value.default_value ?? "";

  if (form.value.field_type === "long_text") {
    payload.markdown = !!form.value.markdown;
  }

  if (form.value.field_type === "number") {
    payload.min_value =
      form.value.min_value === "" ? undefined : form.value.min_value;
    payload.max_value =
      form.value.max_value === "" ? undefined : form.value.max_value;
    payload.allow_decimal = !!form.value.allow_decimal;
    payload.decimal_places = form.value.allow_decimal
      ? typeof form.value.decimal_places !== "undefined"
        ? Number(form.value.decimal_places)
        : 3
      : 0;
  }

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

<style scoped>
:deep(.v-field__append-inner .v-icon),
:deep(.v-field__clearable .v-icon) {
  display: none !important;
}
.icon-radio {
  font-size: 18px;
  line-height: 1;
  vertical-align: middle;
}
</style>
