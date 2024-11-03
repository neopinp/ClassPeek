<!--Course_ID, Credits, Prerequisites-->

<template>
    <div class="coursesPage">
        <h1>Courses</h1>

        <!--Basic text that displays courses upon webpage loading for the first time
        
        IF "courses.length" IS 0: 
            print LOADING COURSES, SUBJECT and MAJOR Information


        ELSE:
            CMPT 475N
            FOR major IN MAJORS
                DISPLAY Majors ---- MEDICAL SCIENCE
                FOR course IN COURSES:
                    DISPLAY Subject_CourseNumber+CourseLetter,CourseTitle_ ----- CMPT 475N CS Project I
                    ADD Dropdown box for Description and Prerequisites
                
        -->

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