<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title class="font-weight-bold">Update Object</v-card-title>
      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="local.name"
            label="Name"
            :rules="[required]"
            required
            variant="outlined"
          />
          <RichTextEditor v-model="local.description" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          variant="outlined"
          color="grey-darken-1"
          @click="dialog = false"
          :disabled="submitting"
        >
          Cancel
        </v-btn>
        <v-btn
          color="blue-lighten-1"
          variant="tonal"
          class="bg-blue-darken-3"
          @click="submit"
          :loading="submitting"
          :disabled="!canSubmit || submitting"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import RichTextEditor from "./RichTextEditor.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  object: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "updated", "error"]);

const store = useStore();

const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

const local = ref({
  object_uuid: null,
  name: "",
  description: "",
});

const formRef = ref(null);
const submitting = ref(false);

const required = (v) => (v && v.toString().trim().length > 0) || "Required";

watch(
  () => props.show,
  (val) => {
    if (val && props.object) {
      local.value = {
        object_uuid: props.object.object_uuid,
        name: props.object.name || "",
        description: props.object.description || "",
      };
    }
  },
  { immediate: true }
);

const canSubmit = computed(
  () => !!local.value.name && local.value.name.toString().trim().length > 0
);

async function submit() {
  const nameTrim = local.value.name?.toString().trim() || "";

  if (!nameTrim) {
    const msg = "Name is required";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  if (!local.value.object_uuid) {
    const msg = "Object identifier missing";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  try {
    submitting.value = true;

    const payload = {
      name: nameTrim,
      description: local.value.description || null,
    };

    const res = await store.dispatch("objects/update", {
      uuid: local.value.object_uuid,
      payload,
    });

    const status = res?.status;
    const data = res?.data ?? {};

    if (
      status === 200 &&
      data?.result &&
      data.result.updated === false &&
      (data.message?.toLowerCase().includes("exists") ||
        data.result.message?.toLowerCase().includes("exists"))
    ) {
      const msg =
        data.message ||
        data.result.message ||
        "Object name already exists for this tenant";
      toast.error(msg);
      emit("error", msg);
      submitting.value = false;
      return;
    }

    if (
      status === 200 &&
      (data.updated === true || !data.result || data.result.updated !== false)
    ) {
      toast.success("Object updated successfully");
      emit("updated", data);
      dialog.value = false;
      submitting.value = false;
      return;
    }

    if (
      status === 200 &&
      data.message &&
      data.message.toLowerCase().includes("exists")
    ) {
      const msg = data.message || "Object name already exists";
      toast.error(msg);
      emit("error", msg);
      submitting.value = false;
      return;
    }

    const msg = data.message || "Unexpected response from server";
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
