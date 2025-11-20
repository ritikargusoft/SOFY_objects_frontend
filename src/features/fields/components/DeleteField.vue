<template>
  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title>Confirm delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete <strong>{{ field?.name }}</strong
        >?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="red" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  field: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "deleted", "error"]);
const store = useStore();
const dialog = computed({
  get: () => props.show,
  set: (v) => emit("update:show", v),
});
async function confirmDelete() {
  if (!props.field?.field_uuid) return;
  try {
    const res = await store.dispatch("fields/deleteField", {
      objectUuid: props.objectUuid,
      fieldUuid: props.field.field_uuid,
    });
    if (res.status === 200 || res.status === 204) {
      emit("deleted", res.data);
      dialog.value = false;
    } else {
      emit("error", res.data?.message ?? "Delete failed");
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    emit("error", msg);
  }
}
</script>
<style scoped></style>
