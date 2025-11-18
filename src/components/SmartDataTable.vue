<template>
  <div>
    <v-card class="elevation-1">
      <v-data-table
        :headers="headers"
        :items="displayItems"
        :item-key="itemKey"
        :height="height"
        fixed-header
        dense
        hover
        class="pa-0"
        :no-data-text="noDataText"
      >
        <template v-for="slotName in Object.keys($slots)" v-if="slotName.startsWith('item.')">
          <slot :name="slotName" v-bind="slotProps" />
        </template>

        <template #no-data>
          <v-card-text class="text-center">{{ noDataText }}</v-card-text>
        </template>
      </v-data-table>
    </v-card>

    <v-row class="mt-2" align="center" justify="space-between" dense>
      <v-col cols="12" sm="6" md="4" class="d-flex align-center">
        <div class="me-2">Rows per page</div>
        <v-select
          :items="itemsPerPageOptions"
          v-model="localItemsPerPage"
          dense
          hide-details
          outlined
          rounded
          style="max-width:120px"
        />
        <div class="mx-3 text-caption">Showing {{ startIndex }} - {{ endIndex }} of {{ total }}</div>
      </v-col>

      <v-col cols="12" sm="6" md="4" class="d-flex justify-end">
        <v-pagination
          v-model="localPage"
          :length="pages"
          total-visible="7"
          :disabled="pages <= 1"
          circle
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  headers: { type: Array, required: true },
  itemKey: { type: String, default: "id" },
  height: { type: [String, Number], default: "60vh" },
  initialPage: { type: Number, default: 1 },
  initialItemsPerPage: { type: Number, default: 15 },
  itemsPerPageOptions: { type: Array, default: () => [10, 15, 30, 50, 100] },
  serverSide: { type: Boolean, default: false }, 
  serverTotalItems: { type: Number, default: 0 }, 
  noDataText: { type: String, default: "No rows" },
});

const emit = defineEmits(["page-change", "items-per-page-change"]);

const localPage = ref(props.initialPage);
const localItemsPerPage = ref(props.initialItemsPerPage);
const total = computed(() => (props.serverSide ? props.serverTotalItems : props.items.length));

const pages = computed(() => {
  return Math.max(1, Math.ceil(total.value / localItemsPerPage.value));
});

watch([localPage, localItemsPerPage], ([p, ipp], [oldP, oldIpp]) => {
  if (p > pages.value) localPage.value = pages.value;
  if (props.serverSide) {
    emit("page-change", { page: localPage.value, itemsPerPage: localItemsPerPage.value });
  }
  emit("items-per-page-change", localItemsPerPage.value);
});

const startIndex = computed(() => {
  if (total.value === 0) return 0;
  return (localPage.value - 1) * localItemsPerPage.value + 1;
});
const endIndex = computed(() => {
  return Math.min(localPage.value * localItemsPerPage.value, total.value);
});

const displayItems = computed(() => {
  if (props.serverSide) return props.items ?? [];
  const start = (localPage.value - 1) * localItemsPerPage.value;
  return props.items.slice(start, start + localItemsPerPage.value);
});

const slotProps = {};
</script>
