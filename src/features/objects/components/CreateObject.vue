<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Create Object</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-text-field v-model="form.name" label="Name" :rules="[required]" required />
          <v-textarea v-model="form.description" label="Description" rows="3" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="submit">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import objectService from "../api/objectService.js";
const props = defineProps({ show: Boolean });
const emit = defineEmits(["update:show", "created"]);
const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val)
});
const form = ref({ name: "", description: "" });
const formRef = ref(null);
const required = (v) => (v && v.toString().trim().length > 0) || "Required";
watch(() => props.show, (val) => {
  if (val) form.value = { name: "", description: "" };
});
async function submit() {
  if (!required(form.value.name)) return;
  try {
    const res = await objectService.createObject({
      name: form.value.name.trim(),
      description: form.value.description || null
    });
    if (res.status === 201) {
      emit("created");
      dialog.value = false;
    } else if (res.status === 200 && res.data?.message?.toLowerCase().includes("already")) {
      console.warn("Name already exists");
    }
  } catch (err) {
    console.error(err);
  }
}
</script>
