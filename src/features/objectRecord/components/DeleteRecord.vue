<template>
  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title class="font-weight-bold">Confirm delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete record
        <strong>{{ record?.record_uuid }}</strong
        >?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          variant="outlined"
          color="grey-darken-1"
          @click="dialog = false"
          >Cancel</v-btn
        >
        <v-btn variant="tonal" class="bg-red" @click="confirmDelete"
          >Delete</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  record: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "deleted", "error"]);

const store = useStore();

const dialog = computed({
  get: () => props.show,
  set: (v) => emit("update:show", v),
});

async function confirmDelete() {
  if (!props.record) return;
  try {
    const id = props.record.record_uuid;
    const res = await store.dispatch("objectRecords/deleteRecord", {
      objectUuid: props.objectUuid,
      recordUuid: id,
    });

    if (res) {
      toast.success("Record deleted successfully");
      emit("deleted", res);
      emit("update:show", false);
      return;
    }
    toast.error("Delete failed");
    emit("error", "Delete failed");
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    toast.error(msg);
    emit("error", msg);
  }
}
</script>
