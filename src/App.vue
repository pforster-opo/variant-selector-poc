<script setup>

</script>

<template>
  <h1>Variant Selector PoC</h1>
  <h2>Base Products</h2>
  <ul>
    <li><a href="/p/bp10004401">bp10004401 - BP with many variants</a></li>
    <li><a href="/p/bp4227900">bp4227900  - BP with purely configurable articles</a></li>
    <li><a href="/p/bp90038248">bp90038248 - BP with configurable articles and STO articles</a></li>
    <li><a href="/p/bp90036796">bp90036796 - combined attribute Farbe/Oberfläche</a></li>
    <li><a href="/p/bp90036969">bp90036969 - range attribute Zylinderüberstand</a></li>
    <li><a href="/p/bp10027176">bp10027176 - multi-value attribute Anschlag and combined attribute Stulp L/B/S</a></li>
  </ul>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>
