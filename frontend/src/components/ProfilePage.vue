<template>
  <div class="ProfilePage">
    <main>
      <section class="leftSide">
        <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
        <h4 class="introduction">Name/Title</h4>
        <br />
        <div class="courses">
          <h4>Courses</h4>
        </div>
      </section>
      <div class="rightSide">
        <article>
          <h1>Guest</h1>
          <p>Sign In to Edit Profile</p>
        </article>
        <footer>
          <div>
            <div class="reviews">Review 1</div>
            <div class="reviews">Review 2</div>
            <div class="reviews">Review 3</div>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import "./styles/ProfilePage.css";
export default defineComponent({
  name: "ProfilePage",
});
</script>
