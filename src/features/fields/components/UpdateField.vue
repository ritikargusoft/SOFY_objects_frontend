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
          />
          <!-- <v-text-field
            v-model="form.field_order"
            label="Order (optional)"
            type="number"
            variant="outlined"
            hide-details
          /> -->
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
        <v-btn variant="tonal" class="bg-blue-darken-3" @click="submit"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

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
        field_name: props.field.name ?? props.field.field_name ?? "",
        field_label: props.field.label ?? props.field.field_label ?? "",
        field_description:
          props.field.description ?? props.field.field_description ?? "",
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
    !form.value.field_name?.trim() ||
    !form.value.field_label?.trim() ||
    !form.value.field_type?.trim()
  ) {
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
