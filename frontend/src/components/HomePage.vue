<template>
  <div class="homePage">
    <main>
      <h1>Welcome to ClassPeek!</h1>
      <p>This is the homepage of our application.</p>
      <br>
      <div>
        <img src="../assets/logo.png" class="logo">
      </div>
      <br>
      <div>
        <input type="text" placeholder="Search">
      </div>
      <nav>
        <section style="background-color:Orange">
          <h4>Majors</h4>
          <ul>
            <li>
              <p>Example Major</p>
            </li>
          </ul>
        </section>
        <section style="background-color:Yellow">
          <h4>Professors</h4>
          <ul>
            <li>
              <p>Example Professor</p>
            </li>
          </ul>
        </section>
      </nav>
    </main>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import "./styles/HomePage.css";
export default defineComponent({
  name: 'HomePage',
});
</script>
  