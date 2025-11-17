<template>
  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Update Object</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="local.name" label="Name" :rules="[required]" required />
          <RichTextEditor v-model="local.description" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancel</v-btn>
        <v-btn color="blue-lighten-1" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

import { ref, watch, computed } from "vue";
import objectService from "../api/objectService.js";
import RichTextEditor from "./RichTextEditor.vue";

const props = defineProps({ show: Boolean, object: Object });
const emit = defineEmits(["update:show", "updated"]);
const dialog = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val)
});
const local = ref({ object_uuid: null, name: "", description: "" });
const required = (v) => (v && v.toString().trim().length > 0) || "Required";

watch(() => props.show, (val) => {
  if (val && props.object) {
    local.value = {
      object_uuid: props.object.object_uuid,
      name: props.object.name,
      description: props.object.description || "" 
    };
  }
});

async function submit() {
  if (!required(local.value.name)) return;
  try {
    const res = await objectService.updateObject(local.value.object_uuid, {
      name: local.value.name.trim(),
      description: local.value.description || null 
    });
    if (res.status === 200) {
      emit("updated");
      dialog.value = false;
    }
  } catch (err) {
    console.error(err);
  }
}
</script>
