<template>
  <v-app-bar app color="blue">
    <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">
      <v-img
        src="https://cdn.freebiesupply.com/logos/large/2x/kpmg-logo-png-transparent.png"
        alt="KPMG Logo"
        max-width="100"
        contain
      ></v-img>
    </v-toolbar-title>

    <v-spacer />

    <div :class="`cursor-pointer d-flex mx-3`">
      <div @click="$router.push('/')" class="d-flex">
        <span class="material-symbols-outlined me-1 "> home </span>
        <div class="">Home</div>
      </div>

      <div @click="$router.push('/')">
        <span class="material-symbols-outlined px-3">person</span>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
export default { name: "AppHeader" };
</script>
