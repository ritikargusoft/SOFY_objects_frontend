<template>
  <MainLayout>
    <div class="pa-6">
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12" md="4" class="d-flex align-center">
          <div class="text-h5 font-weight-medium">Objects</div>
        </v-col>

        <v-col cols="12" md="8" class="d-flex justify-end align-center">
          <v-text-field
            v-model="search"
            placeholder="Search by name or description"
            dense
            clearable
            hide-details
            outlined
            rounded
            prepend-inner-icon="mdi-magnify"
            clear-icon="mdi-close-circle"
            class="ma-0 mr-4"
            style="max-width: 380px"
            @input="applyFilter"
          />

          <v-btn
            color="blue-lighten-1"
            class="d-flex align-center"
            rounded
            elevation="2"
            @click="openCreate"
            aria-label="Create object"
          >
            <span class="material-symbols-outlined mr-2">add</span>
            <span class="text-none">Add</span>
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="elevation-3 rounded-lg">
        <SmartDataTable
          :headers="headers"
          :items="filtered"
          item-key="object_uuid"
          height="60vh"
          :initial-items-per-page="15"
          :items-per-page-options="[10,15,30,50]"
          :no-data-text="'No objects yet. Click Add to create one.'"
          v-model:items-per-page="itemsPerPage"
          :items-per-page-options="[5, 10, 25, 50]"
          v-model:page="page"
        >
          <template #item.name="{ item }">
            <div class="font-weight-medium text-subtitle-2">
              <a
                @click.prevent="goToObject(item)"
                style="cursor: pointer; text-decoration: none; color: inherit"
              >
                {{ item.name ?? "-" }}
              </a>
            </div>
          </template>

          <template #item.description="{ item }">
            <div v-html="sanitize(item.description ?? '-')"></div>
          </template>

          <template #item.last_updated_at="{ item }">
            <div class="text-caption">
              {{ formatDate(item.last_updated_at) }}
            </div>
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
        </SmartDataTable>
      </v-card>

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
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import MainLayout from "../../../layouts/MainLayout.vue";
import CreateObject from "../components/CreateObject.vue";
import UpdateObject from "../components/UpdateObject.vue";
import DeleteObject from "../components/DeleteObject.vue";
import DOMPurify from "dompurify";
import { useRouter } from "vue-router";
import SmartDataTable from "../../../components/SmartDataTable.vue";

const store = useStore();
const router = useRouter();

function goToObject(item) {
  router.push({ name: "ObjectDetail", params: { id: item.object_uuid } });
}

const search = ref("");
const selected = ref(null);
const showCreate = ref(false);
const showEdit = ref(false);
const showDelete = ref(false);

const page = ref(1); 
const itemsPerPage = ref(10); 

const headers = [
  { title: "Name", key: "name", align: "start", sortable: true },
  { title: "Description", key: "description", align: "start" },
  {
    title: "Last Updated",
    key: "last_updated_at",
    align: "center",
    sortable: true,
  },
  { title: "Actions", key: "actions", align: "center", sortable: false },
];

const objects = computed(() => store.getters["objects/all"] ?? []);

async function load() {
  try {
    await store.dispatch("objects/load");
  } catch (err) {
    console.error("Failed to load objects", err);
  }
}

onMounted(load);

function applyFilter() {}

const filtered = computed(() => {
  const q = (search.value || "").trim().toLowerCase();
  let filteredObjects = objects.value;
  if (q) {
    filteredObjects = filteredObjects.filter((o) => {
      const nameMatch = (o.name || "").toLowerCase().includes(q);
      const descText = (o.description || "")
        .replace(/<[^>]*>/g, "")
        .toLowerCase();
      return nameMatch || descText.includes(q);
    });
  }

  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredObjects.slice(start, end);
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
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function sanitize(html) {
  if (!html) return "-";
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
</script>
