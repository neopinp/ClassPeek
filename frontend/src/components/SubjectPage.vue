<!-- Subject, Subject Name-->

<template>
    <div class="subjectsPage">
        <h1>Subjects</h1>

        <!--Basic text that displays 'subjects' upon webpage loading for the first time
        
        IF "subject.length" IS 0: 
            print LOADING SUBJECTS
        ELSE:
            
            FOR subject IN SUBJECTS
                DISPLAY SUBJECTS name
                 - consider a subject description maybe?
                   
        -->

        <p>This is where we see stuff like subjects from the database.</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'subjectsPage',
});
</script>

<style scoped>
.subjectPage {
    text-align: center;
    margin-top: 50px;
}
</style>