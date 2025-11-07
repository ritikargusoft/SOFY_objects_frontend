<template>
  <MainLayout>
    <div class="bg-selected">
      <v-row class="mb-4" align="center" justify="space-between">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search objects"
            dense
            clearable
            @input="applyFilter"
            append-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn color="primary" icon @click="openCreate">
            <span class="material-symbols-outlined" style="font-size: 32px">
              edit
            </span>
          </v-btn>
        </v-col>
      </v-row>
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filtered"
          item-key="object_uuid"
        >
          <template #item.description="{ item }">
            <span>{{ item.description ?? "-" }}</span>
          </template>
          <template #item.last_updated_at="{ item }">
            {{ formatDate(item.last_updated_at ?? item.last_updated_at) }}
          </template>
          <template #item.actions="{ item }">
            <v-btn icon small @click="openEdit(item)">
              <span class="material-symbols-outlined" style="font-size: 32px">
                edit
              </span>
            </v-btn>

            <v-btn icon small color="red" @click="openDelete(item)">
              <span class="material-symbols-outlined" style="font-size: 32px">
                delete
              </span>
            </v-btn>
          </template>
          <template #no-data>
            <v-card-text class="text-center"
              >No objects yet. Click + to add.</v-card-text
            >
          </template>
        </v-data-table>
      </v-card>

      <!-- modals -->
      <CreateObject v-model:show="showCreate" @created="reload" />
      <UpdateObject
        v-model:show="showEdit"
        :object="selected"
        @updated="reload"
      />
      <DeleteObject
        v-model:show="showDelete"
        :object="selected"
        @deleted="reload"
      />
    </div>
  </MainLayout>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import MainLayout from "../../../layouts/MainLayout.vue";
import CreateObject from "../components/CreateObject.vue";
import UpdateObject from "../components/UpdateObject.vue";
import DeleteObject from "../components/DeleteObject.vue";
import objectService from "../api/objectService.js";
const objects = ref([]);
const search = ref("");
const selected = ref(null);
const showCreate = ref(false);
const showEdit = ref(false);
const showDelete = ref(false);
const headers = [
  { title: "Name", value: "name" },
  { title: "Description", value: "description" },
  { title: "Last Updated", value: "last_updated_at" },
  { title: "Actions", value: "actions", sortable: false },
];
async function load() {
  try {
    const data = await objectService.fetchObjects();
    objects.value = data.map((o) => ({
      ...o,
      last_updated_at: o.last_updated_at ?? o.last_updated_at,
    }));
  } catch (err) {
    console.error("Failed to load objects", err);
  }
}
onMounted(load);
function applyFilter() {
  // computed filtered reacts to search
}
const filtered = computed(() => {
  if (!search.value) return objects.value;
  return objects.value.filter((o) =>
    o.name?.toLowerCase().includes(search.value.toLowerCase())
  );
});
function openCreate() {
  showCreate.value = true;
}
function openEdit(obj) {
  selected.value = obj;
  showEdit.value = true;
}
function openDelete(obj) {
  selected.value = obj;
  showDelete.value = true;
}
async function reload() {
  await load();
  showCreate.value = false;
  showEdit.value = false;
  showDelete.value = false;
  selected.value = null;
}
function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}
</script>
