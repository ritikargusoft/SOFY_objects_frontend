<template>
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
        hide-default-footer
        :headers="headers"
        :items="fieldsList"
        item-key="field_uuid"
        dense
        class="elevation-1 mx-0"
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
          <div class="d-flex my-2 justify-center">
            <v-btn icon small class="mr-2" @click="openEdit(item)" title="Edit">
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
          <v-card-text class="text-center">
            No fields yet. Click Add field to create.
          </v-card-text>
        </template>
      </v-data-table>
    </v-card>

    <CreateField
      v-model:show="showCreate"
      :objectUuid="objectId"
      @created="onCreated"
      @error="onError"
    />
    <UpdateField
      v-model:show="showEditField"
      :objectUuid="objectId"
      :field="selectedField"
      @updated="onUpdated"
      @error="onError"
    />
    <DeleteField
      v-model:show="showDeleteField"
      :objectUuid="objectId"
      :field="selectedField"
      @deleted="onDeleted"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import CreateField from "../components/CreateField.vue";
import UpdateField from "../components/UpdateField.vue";
import DeleteField from "../components/DeleteField.vue";

const store = useStore();
const route = useRoute();
const objectId = route.params.id;

const showCreate = ref(false);
const showEditField = ref(false);
const showDeleteField = ref(false);
const selectedField = ref(null);

const headers = [
  { title: "Order", key: "field_order", align: "start" },
  { title: "ID", key: "field_uuid", align: "start" },
  { title: "Name", key: "name", align: "start" },
  { title: "Label", key: "label", align: "start" },
  { title: "Type", key: "field_type", align: "start" },
  { title: "Actions", key: "actions", align: "center" },
];

const object = computed(() => store.getters["objects/byId"](objectId));
const fieldsList = computed(() =>
  store.getters["fields/getByObject"](objectId)
);

async function ensureObjectsLoaded() {
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
  }
}

onMounted(async () => {
  await ensureObjectsLoaded();
  await loadFields();
});

async function onCreated() {
  await loadFields();
  showCreate.value = false;
}

async function onUpdated() {
  await loadFields();
  showEditField.value = false;
  selectedField.value = null;
}

async function onDeleted() {
  await loadFields();
  showDeleteField.value = false;
  selectedField.value = null;
}

function onError(_msg) {}

function openEdit(item) {
  selectedField.value = item;
  showEditField.value = true;
}

function openDelete(item) {
  selectedField.value = item;
  showDeleteField.value = true;
}
</script>

<style scoped></style>
