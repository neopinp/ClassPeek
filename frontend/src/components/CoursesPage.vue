<template>
    <div class="coursesPage">
        <h1>Courses</h1>
        <p>This is where we see stuff like courses from the database.</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CoursesPage',
});
</script>

<style scoped>
.coursesPage {
    text-align: center;
    margin-top: 50px;
}
</style>