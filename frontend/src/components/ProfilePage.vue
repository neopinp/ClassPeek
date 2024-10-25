<template>
  <div class="ProfilePage">
    <main>
      <section>
        <div>
          <div>
            <!-- Image placeholder for Guest Accounts who have not signed in -->
            <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
          </div>
          <h4>Title</h4>
        </div>
        <br />
        <div>
          <h4>Bio</h4>
        </div>
      </section>
      <article>
        <h1>Guest</h1>
        <p>Informational Text</p>
      </article>
    </main>
    <footer>
      <h2>Comment Section</h2>
      <ol>
        <li>Comment 1</li>
        <li>Comment 2</li>
        <li>Comment 3</li>
      </ol>
    </footer>
  </div>
</template>



<script lang="ts">
import { defineComponent } from "vue";
import './styles/ProfilePage.css';
export default defineComponent({
  name: "ProfilePage",
});


</script>


