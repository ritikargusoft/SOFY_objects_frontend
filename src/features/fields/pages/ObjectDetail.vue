<template>
  <MainLayout>
    <div class="pa-6">
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12" md="6">
          <div class="text-h6">{{ object?.name ?? "Object" }}</div>
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
          :items="fields"
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

          <template #item.actions="{ item }">
            <div class="d-flex">
              <v-btn
                icon
                small
                class="mr-2"
                @click="openEdit(item)"
                title="Edit"
              >
                <span class="material-symbols-outlined">edit</span>
              </v-btn>

              <v-btn
                icon
                small
                color="red"
                @click="openDelete(item)"
                title="Delete"
              >
                <span class="material-symbols-outlined">delete</span>
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <v-card-text class="text-center"
              >No fields yet. Click Add field to create.</v-card-text
            >
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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "../../../layouts/MainLayout.vue";
import CreateField from "../components/CreateField.vue";
import * as objectService from "../../objects/api/objectService.js";
import * as fieldService from "../api/fieldService.js";

const route = useRoute();
const objectId = route.params.id;
const object = ref(null);
const fields = ref([]);
const showCreate = ref(false);

const snackbar = ref({ show: false, message: "", timeout: 3000 });

const headers = [
  { title: "Order", key: "field_order", align: "start" },
  { title: "ID", key: "field_uuid", align: "start" },
  { title: "Name", key: "name", align: "start" },
  { title: "Label", key: "label", align: "start" },
  { title: "Type", key: "field_type", align: "start" },
  { title: "Actions", key: "actions", align: "center", sortable: false },
];

function showMsg(msg) {
  snackbar.value.message = msg;
  snackbar.value.show = true;
}

function onError(msg) {
  showMsg(msg || "Something went wrong");
}

async function loadObject() {
  try {
    object.value = await objectService.getObjectByUuid(objectId);
  } catch (err) {
    console.error("Failed to load object", err);
    onError("Failed to load object");
  }
}

async function loadFields() {
  try {
    fields.value = await fieldService.fetchFields(objectId);
  } catch (err) {
    console.error("Failed to load fields", err);
    onError("Failed to load fields");
  }
}

onMounted(async () => {
  await loadObject();
  await loadFields();
});

async function onCreated(payload) {
  showMsg("Field created");
  await loadFields();
  showCreate.value = false;
}
</script>
