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
          <router-link to="/info">Info</router-link>
        </li>
        <li>
          <router-link to="/courses">Courses</router-link>
        </li>
        <li>
          <router-link to="/profile" id="profileIcon">
            <font-awesome-icon :icon="faUser"/>
          </router-link>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default defineComponent({
  name: "ProfilePage",
  components: {
    FontAwesomeIcon,
  },
  setup() {
    return {
      faUser,
    };
  },
});
</script>

<style>
* {
  box-sizing: border-box;
}

nav {
  background-color: #42b983;
  padding: 1rem;
  position: relative;
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


#profileIcon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%)
}
#profileIcon.router-link-exact-active {
  color: green;
}

</style>