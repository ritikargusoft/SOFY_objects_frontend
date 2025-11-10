<template>
  <v-app>
    <Header />
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
    <v-footer>
      <p class="text-body-2 font-weight-thin pt-4">2025 © KPMG</p>
    </v-footer>
  </v-app>
</template>
<script setup>
import Header from "../components/layout/Header.vue";
</script>
