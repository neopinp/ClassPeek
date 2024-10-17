<template>
  <div id="app">
    <nav>
      <ul>
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/about">About</router-link>
        </li>
        <li>
          <router-link to="/courses">Courses</router-link>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<style>
nav {
  background-color: #42b983;
  padding: 1rem;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 0;
  padding: 0;
}

nav ul li a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav ul li a.router-link-exact-active {
  text-decoration: underline;
}
</style>
