

<template>
  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title>Confirm delete</v-card-title>
      <v-card-text>
        Are you sure you want to delete <strong>{{ object?.name }}</strong>?
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
import objectService from "../api/objectService.js";
const props = defineProps({ show: Boolean, object: Object });
const emit = defineEmits(["update:show", "deleted"]);
const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val)
});
async function confirmDelete() {
  if (!props.object?.object_uuid) return;
  try {
    const res = await objectService.deleteObject(props.object.object_uuid);
    if (res.status === 204 || res.status === 200) {
      emit("deleted");
      dialog.value = false;
    }
  } catch (err) {
    console.error(err);
  }
}
</script>






