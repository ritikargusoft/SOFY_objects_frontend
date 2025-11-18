<template>
  <MainLayout>
    <div class="pa-6">
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12" md="6">
          <div class="text-h6">{{ object?.name ?? "Object" }}</div>
          <div class="text-caption grey--text">
            {{ stripHtml(object?.description) }}
          </div>
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn
            color="blue-lighten-1"
            class="d-flex align-center"
            rounded
            elevation="2"
            @click="showCreate = true"
          >
            <span class="material-symbols-outlined mr-2">add</span>
            <span>Add field</span>
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="mb-4">
        <v-data-table
          :headers="headers"
          :items="fieldsList"
          item-key="field_uuid"
          dense
          class="elevation-1"
        >
          <template #item.field_order="{ item }">
            <div>{{ item.field_order }}</div>
          </template>

          <template #item.field_uuid="{ item }">
            <div>{{ item.field_uuid }}</div>
          </template>

          <template #item.name="{ item }">
            <div class="font-weight-medium">{{ item.name }}</div>
          </template>

          <template #item.label="{ item }">
            <div>{{ item.label }}</div>
          </template>

          <template #item.type="{ item }">
            <div>{{ item.field_type ?? item.type }}</div>
          </template>

          <template #no-data>
            <v-card-text class="text-center">No fields yet. Click Add field to create.</v-card-text>
          </template>
        </v-data-table>
      </v-card>

      <CreateField
        v-model:show="showCreate"
        :objectUuid="objectId"
        @created="onCreated"
        @error="onError"
      />

      <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
        {{ snackbar.message }}
        <template #actions>
          <v-btn text @click="snackbar.show = false">Close</v-btn>
        </template>
      </v-snackbar>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import MainLayout from "../../../layouts/MainLayout.vue";
import CreateField from "../components/CreateField.vue";

const store = useStore();
const route = useRoute();
const objectId = route.params.id;

const showCreate = ref(false);
const snackbar = ref({ show: false, message: "", timeout: 3000 });

const headers = [
  { title: "Order", key: "field_order", align: "start" },
  { title: "ID", key: "field_uuid", align: "start" },
  { title: "Name", key: "name", align: "start" },
  { title: "Label", key: "label", align: "start" },
  { title: "Type", key: "field_type", align: "start" },
];

const object = computed(() => store.getters["objects/byId"](objectId));
const fieldsList = computed(() => store.getters["fields/getByObject"](objectId));

function showMsg(msg) {
  snackbar.value.message = msg;
  snackbar.value.show = true;
}

function onError(msg) {
  showMsg(msg || "Something went wrong");
}

async function ensureObjectsLoaded() {
  // if object not present in store, load list
  if (!object.value) {
    try {
      await store.dispatch("objects/load");
    } catch (err) {
      console.error("Failed to load objects", err);
    }
  }
}

async function loadFields() {
  try {
    await store.dispatch("fields/fetchFields", objectId);
  } catch (err) {
    console.error("Failed to load fields", err);
    onError("Failed to load fields");
  }
}

onMounted(async () => {
  await ensureObjectsLoaded();
  await loadFields();
});

async function onCreated(_payload) {
  showMsg("Field created");
  // fields module auto-refetches after create (store action does that)
  showCreate.value = false;
}

function stripHtml(html = "") {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
</script>

<style scoped></style>
