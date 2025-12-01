<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title class="font-weight-bold">Add Field</v-card-title>

      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.field_name"
            label="Name *"
            :rules="[required]"
            variant="outlined"
            hint='The characters .<>:"/|?*=!;`~% are not allowed.'
            persistent-hint
            class="mb-4"
          />

          <v-textarea
            v-model="form.field_label"
            label="Label *"
            :rules="[required]"
            variant="outlined"
            rows="4"
          />
          <v-textarea
            v-model="form.field_description"
            label="Description"
            variant="outlined"
            rows="3"
          />
          <v-select
            v-model="form.field_type"
            :items="types"
            label="Field type"
            :rules="[required]"
            variant="outlined"
            dense
            class="mb-4"
          />

          <div
            v-if="
              form.field_type === 'short_text' ||
              form.field_type === 'long_text' ||
              form.field_type === 'number' ||
              form.field_type === 'email'
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
              <label class="text-body-2 mb-2 d-block">
                Enable Markdown Editor
              </label>

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

            <div v-if="form.field_type === 'number'" class="my-3">
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
                persistent-hint
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
                  class="w-100"
                  label="Number of digits after the decimal"
                  variant="outlined"
                  :error="!!decimalPlacesError"
                  :error-messages="
                    decimalPlacesError ? [decimalPlacesError] : []
                  "
                  style="width: 150px"
                />
              </div>
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
                  label="Default value"
                  variant="outlined"
                  :error="!!defaultValueError"
                  :error-messages="defaultValueError ? [defaultValueError] : []"
                  rows="3"
                />
              </div>
            </div>

            <div v-else-if="form.field_type === 'number'">
              <v-text-field
                v-model="form.default_value"
                label="Default value"
                variant="outlined"
                type="number"
                :error="!!defaultValueError"
                :error-messages="defaultValueError ? [defaultValueError] : []"
              />
            </div>

            <div v-else-if="form.field_type === 'email'">
              <v-text-field
                v-model="form.default_value"
                label="Default email"
                variant="outlined"
                type="email"
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
        >
          Create
        </v-btn>
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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
});
const emit = defineEmits(["update:show", "created", "error"]);

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
    if (v) {
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
  }
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
    return `Max Length must not be greater than ${VARCHAR_MAX_LIMIT}`;
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
    return "Min must be a number";

  if (max !== null && max !== "" && Number.isNaN(Number(max)))
    return "Max must be a number";

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

  // email default validation
  if (form.value.field_type === "email") {
    const dv = form.value.default_value;
    if (dv === null || dv === "" || typeof dv === "undefined") return "";
    const ds = String(dv).trim();
    if (ds === "") return "";
    if (!EMAIL_REGEX.test(ds)) return "Default must be a valid email";
    return "";
  }

  //number default
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
      // if decimals not allowed but default has decimals
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
    const msg = "Please fix validation errors and fill required fields";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  const payload = {
    field_name: form.value.field_name.trim(),
    field_label: form.value.field_label.trim(),
    field_description: form.value.field_description?.trim() ?? null,
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

  // include default_value only if provided (empty string means user intentionally wants empty default)
  if (form.value.field_type === "email") {
    payload.default_value =
      typeof form.value.default_value !== "undefined" &&
      form.value.default_value !== null
        ? String(form.value.default_value).trim()
        : "";
  } else {
    if (
      typeof form.value.default_value !== "undefined" &&
      form.value.default_value !== null &&
      form.value.default_value !== ""
    ) {
      payload.default_value = form.value.default_value;
    }
  }

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
    if (
      typeof form.value.default_value !== "undefined" &&
      form.value.default_value !== null &&
      form.value.default_value !== ""
    ) {
      payload.default_value = form.value.default_value;
    }
  }

  try {
    const res = await store.dispatch("fields/createField", {
      objectUuid: props.objectUuid,
      payload,
    });

    if (res.status === 201) {
      toast.success("Field created successfully");
      emit("created", res.data);
      dialog.value = false;
    } else if (res.status === 200) {
      const msg = res.data?.message ?? "Field already exists";
      toast.error(msg);
      emit("error", msg);
    } else {
      const msg = "Unexpected response from server";
      toast.error(msg);
      emit("error", msg);
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    toast.error(msg);
    emit("error", msg);
  }
}
</script>
