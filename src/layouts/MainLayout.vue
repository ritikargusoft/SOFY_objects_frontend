
<template>
  <v-app>
    <Header />
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
    <v-footer padless>
      <v-col  class="  text-center py-4">© KPMG SOFY - Demo</v-col>
    </v-footer>
  </v-app>
</template>
<script setup>
import Header from "../components/layout/Header.vue";
</script>