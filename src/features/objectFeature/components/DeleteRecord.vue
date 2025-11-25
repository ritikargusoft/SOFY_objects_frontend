<template>
  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title>Confirm delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete record
        <strong>{{ record?.record_uuid }}</strong
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
import objectRecordService from "../api/objectRecordService.js";

const props = defineProps({
  show: { type: Boolean, default: false },
  objectUuid: { type: String, required: true },
  record: { type: Object, default: null },
});
const emit = defineEmits(["update:show", "deleted", "error"]);

const dialog = computed({
  get: () => props.show,
  set: (v) => emit("update:show", v),
});
async function confirmDelete() {
  if (!props.record) return;
  try {
    const id = props.record.record_uuid;
    const res = await objectRecordService.deleteRecord(props.objectUuid, id);

    const status = res?.status;
    const data = res?.data ?? res;

    if (
      (typeof status === "number" && status >= 200 && status < 300) ||
      data === null ||
      data === undefined ||
      (data && Object.keys(data).length >= 0)
    ) {
      emit("deleted", data ?? {});
      emit("update:show", false);
      return;
    }

    const msg = res?.data?.message ?? res?.message ?? "Delete failed";
    emit("error", msg);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message ?? String(err);
    console.error(
      "DeleteRecord: unexpected error response:",
      err?.response ?? err
    );
    emit("error", msg);
  }
}
</script>

<style scoped></style>
