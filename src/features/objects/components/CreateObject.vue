<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title class="font-weight-bold">Create Object</v-card-title>

      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-text-field
            v-model="form.name"
            label="Name"
            variant="outlined"
            :rules="[required]"
            required
          />
          <h4>Description</h4>

          <RichTextEditor v-model="form.description" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          text
          @click="dialog = false"
          :disabled="submitting"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="tonal"
          class="bg-blue-darken-3"
          @click="submit"
          :loading="submitting"
          :disabled="!canSubmit || submitting"
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
import RichTextEditor from "./RichTextEditor.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["update:show", "created", "error"]);

const store = useStore();

const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

const formRef = ref(null);
const form = ref({
  name: "",
  description: "",
});

const submitting = ref(false);

const required = (v) => (v && v.toString().trim().length > 0) || "Required";

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.value = { name: "", description: "" };
    }
  }
);

const canSubmit = computed(
  () => !!form.value.name && form.value.name.toString().trim().length > 0
);

async function submit() {
  const nameTrim = form.value.name?.toString().trim() || "";

  if (!nameTrim) {
    const msg = "Name is required";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  try {
    submitting.value = true;

    const payload = {
      name: nameTrim,
      description: form.value.description || null,
    };

    const res = await store.dispatch("objects/create", payload);
    const status = res?.status;
    const data = res?.data ?? {};

    if (status === 201) {
      toast.success("Object created successfully");
      emit("created", data);
      dialog.value = false;
      submitting.value = false;
      return;
    }

    if (
      status === 200 &&
      (data.message?.toLowerCase().includes("already") ||
        data.result?.created === false)
    ) {
      const msg =
        data.message || data.result?.message || "Object name already exists";
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
