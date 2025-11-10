<template>
  <MainLayout>
    <v-container class="pa-8 fill-height d-flex justify-center align-center">
      <v-row justify="center" align="center" spacing="4">
        <v-col cols="12" sm="6" md="4">
          <v-sheet
            class="d-flex flex-column align-center justify-center rounded-lg"
            height="200"
            width="200"
            :class="[
              'border',
              isActive1 ? 'bg-blue-darken-4' : 'bg-blue-lighten-5',
            ]"
            @click="goObjects"
            @mouseover="isActive1 = true"
            @mouseleave="isActive1 = false"
            style="cursor: pointer"
          >
            <div
              :class="[
                'd-flex align-center justify-center rounded-circle',
                isActive1 ? 'bg-white' : 'bg-blue-darken-3',
              ]"
              :style="circleStyle"
            >
              <span
                :class="[isActive1 ? 'text-black' : 'text-white']"
                class="material-symbols-outlined"
              >
                data_table
              </span>
            </div>

            <div class="d-flex mt-2 align-center">
              <div
                :class="[
                  isActive1 ? 'text-white' : 'blue--text text--darken-3',
                  'font-medium',
                ]"
              >
                Objects
              </div>
              <span
                :class="[
                  isActive1 ? 'text-white' : 'blue--text text--darken-3',
                  'material-symbols-outlined ml-2',
                ]"
              >
                keyboard_arrow_right
              </span>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-sheet
            class="d-flex flex-column align-center justify-center rounded-lg"
            height="200"
            width="200"
            :class="[
              'border',
              isActive2 ? 'bg-blue-darken-4' : 'bg-blue-lighten-5',
            ]"
            @click="goObjects"
            @mouseover="isActive2 = true"
            @mouseleave="isActive2 = false"
            style="cursor: pointer"
          >
            <div
              :class="[
                'd-flex align-center justify-center rounded-circle',
                isActive2 ? 'bg-white' : 'bg-blue-darken-3',
              ]"
              :style="circleStyle"
            >
              <span
                :class="[isActive2 ? 'text-black' : 'text-white']"
                class="material-symbols-outlined"
              >
                edit
              </span>
            </div>

            <div class="d-flex mt-2 align-center">
              <div
                :class="[
                  isActive2 ? 'text-white' : 'blue--text text--darken-3',
                  'font-medium',
                ]"
              >
                SQL Editor
              </div>
              <span
                :class="[
                  isActive2 ? 'text-white' : 'blue--text text--darken-3',
                  'material-symbols-outlined ml-2',
                ]"
              >
                keyboard_arrow_right
              </span>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </MainLayout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "../../layouts/MainLayout.vue";

const router = useRouter();
function goObjects() {
  router.push({ name: "Objects" });
}

const isActive1 = ref(false);
const isActive2 = ref(false);

const circleStyle = {
  width: "56px",
  height: "56px",
};
</script>

<style>
.rounded-circle {
  border-radius: 50% !important;
}
</style>
