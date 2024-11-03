<!-- Major, Major Description, Major Pathway  -->

<template>
    <div class="majorsPage">
        <h1>Majors</h1>

        <!--Basic text that displays 'majors' upon webpage loading for the first time
        
        IF "majors.length" IS 0: 
            print LOADING MAJORS
        ELSE:
            
            FOR major IN MAJORS
                DISPLAY Major
                    - Dropdown box for Major description, pathway (& pathway order)
        -->

        <p>This is where we see stuff like majors from the database.</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MajorsPage',
});
</script>

<style scoped>
.majorsPage {
    text-align: center;
    margin-top: 50px;
}
</style>