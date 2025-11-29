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

const VARCHAR_MAX_LIMIT = 1000000000;

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
      };
    }
  }
);

const maxLengthError = computed(() => {
  if (form.value.field_type !== "short_text") return "";
  const v = form.value.max_length;
  if (v === null || v === undefined || v === "") return "";
  const num = Number(v);
  if (Number.isNaN(num) || num <= 0)
    return "Max Length must be a positive number";
  if (num > VARCHAR_MAX_LIMIT)
    return `Max Length must be a greater than ${VARCHAR_MAX_LIMIT}`;

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

  if (form.value.field_type === "short_text") {
    const ml = form.value.max_length;
    payload.max_length = ml ? Number(ml) : 200;
  }

  if (form.value.default_value !== "") {
    payload.default_value = form.value.default_value;
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
