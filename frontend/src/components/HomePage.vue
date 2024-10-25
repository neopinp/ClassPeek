<template>
  <div class="homePage">
    <main>
      <h1>Welcome to ClassPeek!</h1>
      <p>This is the homepage of our application.</p>
      <br>
      <div>
        <h4>Icon</h4>
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
  
export default defineComponent({
  name: 'HomePage',
});
</script>
  
<style scoped>
.homePage {
  text-align: center;
  margin-top: 50px;
}
 .homePage main {
  margin-top: 50px; /* Add a top margin to avoid content overlay */
  height: 500px;
  background: #ccc;
}


 .homePage nav {
  display: flex;
}

 .homePage nav > section {
  width:50%;
}

.homePage section {
  border: 1px solid black;
  padding: 20px;
  margin: 10px;
}

.homePage div {
  margin: auto;
  width: fit-content;
  border: 1px solid black;
  background: #ddd;
  padding: 20px;
}

.homePage h1,h2,h3,h4,h5,h6 {
  text-align: center;
}
</style>
  