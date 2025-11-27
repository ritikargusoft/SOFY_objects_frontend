<template>
  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title class="font-weight-bold">Confirm delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete
        <strong>{{ object?.name }}</strong
        >?
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
          variant="tonal"
          class="bg-red"
          @click="confirmDelete"
          :loading="submitting"
          :disabled="submitting"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const props = defineProps({
  show: { type: Boolean, default: false },
  object: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "deleted", "error"]);

const store = useStore();
const submitting = ref(false);

const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

async function confirmDelete() {
  if (!props.object?.object_uuid) {
    const msg = "Object identifier missing";
    toast.error(msg);
    emit("error", msg);
    return;
  }

  try {
    submitting.value = true;
    const res = await store.dispatch(
      "objects/delete",
      props.object.object_uuid
    );
    const status = res?.status;

    if (status === 204 || status === 200) {
      toast.success("Object deleted successfully");
      emit("deleted", res?.data ?? {});
      dialog.value = false;
      submitting.value = false;
      return;
    }

    const msg = res?.data?.message ?? "Delete failed";
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
