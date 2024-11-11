<template>
  <div class="ProfilePage">
    <main>
      <section class="leftSide">
        <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
        <h4 class="introduction">{{ user.name || "Guest" }}</h4>
        <p v-if="user.blurb">{{ user.blurb }}</p>
        <p v-else>No bio available.</p>
      </section>
      <div class="rightSide">
        <article>
          <h1>{{ user.name || "Guest" }}</h1>
          <p v-if="!user.name">Sign In to Edit Profile</p>
          <p v-else>Welcome, {{ user.name }}.</p>
        </article>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import sessionStore from "../store/session";
import "./styles/ProfilePage.css";

export default defineComponent({
  name: "ProfilePage",
  setup() {
    onMounted(() => {
      // Ensure session is up-to-date on page load
      sessionStore.fetchSession();
    });

    return {
      user: sessionStore.user,
    };
  },
});
</script>