<template>
  <MainLayout>
    <div class="pa-6">
      <v-btn @click="goBack" title="Back to Objects" class="mb-4">
        <span class="material-symbols-outlined"> arrow_back</span>
        <div>Back to objects</div>
      </v-btn>

      <v-card>
        <v-tabs v-model="activeTab" background-color="transparent">
          <v-tab value="records">Object Records</v-tab>
          <v-tab value="manage">Manage</v-tab>
        </v-tabs>

        <v-card-text>
          <div v-if="activeTab === 'records'">
            <div class="d-flex justify-space-between mb-4">
              <div class="text-h6 ms-10">{{ object?.name ?? "Object" }}</div>

              <div class="d-flex w-50 justify-end">
                <v-text-field
                  v-model="search"
                  dense
                  clearable
                  hide-details
                  class="ma-0 mr-4 w-50"
                  style="max-width: 380px"
                  @input="applyFilter"
                />

                <div>
                  <v-btn icon @click="openCreateRecord" title="Add record">
                    <span class="material-symbols-outlined">add</span>
                  </v-btn>
                </div>
              </div>
            </div>

            <v-data-table
              :headers="recordHeaders"
              :items="recordsFiltered"
              item-key="record_uuid"
              dense
              class="elevation-0"
              :no-data-text="'No records yet. Click + to create one.'"
              disable-sort
            >
              <template #item.actions="{ item }">
                <div class="d-flex">
                  <v-btn
                    icon
                    small
                    @click="openDeleteRecord(item)"
                    title="Delete"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </v-btn>
                </div>
              </template>

              <template
                v-for="field in dynamicFields"
                v-slot:[`item.${field.nameSan}`]="{ item }"
              >
                <div :key="field.nameSan">{{ item[field.nameSan] ?? "-" }}</div>
              </template>

              <template #no-data>
                <v-card-text>
                  No records yet. Click + to create one.
                </v-card-text>
              </template>
            </v-data-table>
          </div>

          <div v-if="activeTab === 'manage'">
            <ManageFields :objectUuid="objectId" />
          </div>
        </v-card-text>
        <v-divider />
      </v-card>
    </div>

    <CreateRecord
      v-model:show="showCreateRecordDialog"
      :objectUuid="objectId"
      :fields="fieldsMeta"
      @created="onRecordCreated"
      @error="onError"
    />
    <DeleteRecord
      v-model:show="showDeleteRecordDialog"
      :objectUuid="objectId"
      :record="selectedRecord"
      @deleted="onRecordDeleted"
      @error="onError"
    />
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import MainLayout from "../../../layouts/MainLayout.vue";
import CreateRecord from "../components/CreateRecord.vue";
import DeleteRecord from "../components/DeleteRecord.vue";
import ManageFields from "../../fields/pages/ObjectDetail.vue";
import { sanitizeIdentifier } from "../utils/sanitize.js";

const store = useStore();
const route = useRoute();
const router = useRouter();

const objectId = route.params.id;
const qTab = route.query.tab ?? "records";
const activeTab = ref(qTab);

watch(activeTab, (val) => {
  router
    .replace({ query: { ...(route.query || {}), tab: val } })
    .catch(() => {});
});

function goBack() {
  router.push({ name: "Objects" }).catch(() => {});
}

const search = ref("");
const showCreateRecordDialog = ref(false);
const showDeleteRecordDialog = ref(false);
const selectedRecord = ref(null);

const object = computed(() => store.getters["objects/byId"](objectId));

const fieldsMeta = computed(
  () => store.getters["fields/getByObject"](objectId) || []
);

const dynamicFields = computed(() =>
  (fieldsMeta.value || []).map((f) => {
    const nameSan = sanitizeIdentifier(
      f.name || f.field_name || f.field_uuid || ""
    );
    return { ...f, nameSan };
  })
);

const records = computed(() => {
  const getter = store.getters["objectRecords/getByObject"];
  return typeof getter === "function" ? getter(objectId) : [];
});

const recordHeaders = computed(() => {
  const base = [
    { title: "ID", key: "record_id" },
    { title: "UUID", key: "record_uuid" },
  ];
  const dyn = dynamicFields.value.map((f) => ({
    title: f.label || f.name,
    key: f.nameSan,
  }));
  const audit = [
    { title: "Created At", key: "created_at" },
    { title: "Created By", key: "created_by" },
    { title: "Updated At", key: "last_updated_at" },
    { title: "Updated By", key: "last_updated_by" },
  ];
  const actions = [{ title: "Actions", key: "actions", sortable: false }];
  return [...base, ...dyn, ...audit, ...actions];
});

const recordsFiltered = computed(() => {
  const list = records.value ?? [];
  const q = (search.value || "").trim().toLowerCase();
  if (!q) return list;

  return list.filter((r) => {
    const byId =
      String(r.record_id ?? "")
        .toLowerCase()
        .includes(q) ||
      String(r.record_uuid ?? "")
        .toLowerCase()
        .includes(q);
    if (byId) return true;

    for (const f of dynamicFields.value) {
      const v = String(r[f.nameSan] ?? "").toLowerCase();
      if (v.includes(q)) return true;
    }
    return false;
  });
});

function applyFilter() {}

async function loadObjectAndFields() {
  if (!object.value) {
    await store.dispatch("objects/load");
  }
  await store.dispatch("fields/fetchFields", objectId);
}

async function loadRecords() {
  try {
    await store.dispatch("objectRecords/fetchRecords", objectId);
  } catch (err) {
    console.error("Failed to load records", err);
  }
}

onMounted(async () => {
  await loadObjectAndFields();
  await loadRecords();
});

function openCreateRecord() {
  showCreateRecordDialog.value = true;
}

function openDeleteRecord(item) {
  selectedRecord.value = item;
  showDeleteRecordDialog.value = true;
}

async function onRecordCreated() {
  await loadRecords();
  showCreateRecordDialog.value = false;
}

async function onRecordDeleted() {
  await loadRecords();
  showDeleteRecordDialog.value = false;
  selectedRecord.value = null;
}

function onError(msg) {
  console.warn(msg || "Something went wrong");
}
</script>
