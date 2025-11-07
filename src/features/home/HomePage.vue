<template>
  <MainLayout>
    <v-container class="pa-8 fill-height">
      <v-row class="fill-height" align="center" justify="center">
        <v-col cols="12" md="6" class="text-center">
          <v-card
            class="pa-6"
            @click="goObjects"
            style="cursor: pointer"
          >
            <v-row align="center" justify="center">
              <span class="material-symbols-outlined" style="font-size: 64px"
                >database</span
              >
            </v-row>
            <h2 class="mt-4">Objects</h2>
            <div class="mt-2">Manage objects and their fields</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </MainLayout>
</template>
<script setup>
import { useRouter } from "vue-router";
import MainLayout from "../../layouts/MainLayout.vue";
const router = useRouter();
function goObjects() {
  router.push({ name: "Objects" });
}
</script>
