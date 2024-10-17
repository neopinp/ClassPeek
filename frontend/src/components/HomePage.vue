<template>
  <div class="homePage">
    <h1>Welcome to ClassPeek!</h1>
    <p>This is the homepage of our application.</p>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
  
export default defineComponent({
  name: 'HomePage',
});
</script>
  
<style scoped>
.homePage {
  text-align: center;
  margin-top: 50px;
}
</style>
  