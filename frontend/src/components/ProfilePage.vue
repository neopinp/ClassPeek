<template>
  <div class="ProfilePage">
    <main>
      <section class="leftSide">
        <div>
          <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
          <h4 class="introduction">Name/Title</h4>
        </div>
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
        <input class="addComment" placeholder="Add Comment..." />
        <footer>
          <h2>Comment Section</h2>
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
