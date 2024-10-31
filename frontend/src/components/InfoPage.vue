<template>
  <div class="InfoPage">
    <main>
      <section>
        <div>
          <div>
            <h4>Img</h4>
          </div>
          <h4>Title</h4>
        </div>
        <br>
        <div>
          <h4>Add Info</h4>
        </div>
      </section>
      <article>
        <h2>Topic</h2>
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

export default defineComponent({
  name: "InfoPage",
});
</script>

<style scoped>
.InfoPage {
  margin-top: 50px;
}
.InfoPage main {
  height: 460px;
  display: flex;
}
.InfoPage article {
  flex: 9;
  background-color: #f1f1f1;
  padding: 10px;
}
.InfoPage section {
  flex: 1;
  background: #ccc;
  padding: 20px;
}
.InfoPage div {
  border: 1px solid black;
  background: #ddd;
  padding: 20px;
}
.InfoPage footer {
  background-color: #777;
  padding: 10px;
  color: white;
}
.InfoPage h1,
h2,
h3,
h4,
h5,
h6 {
  text-align: center;
}
</style>
