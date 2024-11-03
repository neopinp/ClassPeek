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
          <ol>
            <!-- Placeholder hyperlinks given a list of majors -->
            <li id="homepage-majorli" v-for="major in maristMajors" :key="major">
              {{ major }}
            </li>
          </ol>
        </section>



        <section style="background-color:Yellow">
          <h4>Professors</h4>
          <ol>
            <li id="homepage-professorli" v-for="professor in maristProfessors" :key="professor">
              {{ professor }}
            </li>
          </ol>
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
  // Placeholder data of ALL the majors in an array
  data() {
    return {
      maristMajors: [
        "Business Administration and Management",
        "Communication",
        "Fashion Merchandising",
        "Psychology",
        "Criminal Justice/Law Enforcement Administration",
        "Computer Science",
        "Political Science and Government",
        "Accounting",
        "Mass Communication/Media Studies",
        "Biology/Biological Sciences",
        "Education/Teaching of Individuals in Elementary Special Education Programs",
        "Clinical Laboratory Science/Medical Technology/Technologist",
        "Biomedical Sciences",
        "Fashion/Apparel Design",
        "Intermedia/Multimedia",
        "Economics",
        "Game and Interactive Media Design",
        "Computer and Information Systems Security/Information Assurance",
        "English Language and Literature",
        "Social Work",
        "History",
        "Information Technology",
        "Fine/Studio Arts",
        "Natural Resources Management and Policy",
        "Applied Mathematics",
        "Mathematics Teacher Education",
        "History Teacher Education",
        "Multi-/Interdisciplinary Studies",
        "Computer and Information Sciences",
        "Philosophy",
        "Athletic Training/Trainer",
        "Computer Software and Media Applications",
        "Biochemistry",
        "Mathematics",
        "English/Language Arts Teacher Education",
        "Italian Language and Literature",
        "Spanish Language and Literature",
        "American/United States Studies/Civilization",
        "Biology Teacher Education",
        "Chemistry Teacher Education",
        "Chemistry"
      ],
      maristProfessors: [
        "Dr. John Smith",
        "Prof. Jane Doe",
        "Dr. Michael Johnson",
        "Prof. Emily White",
        "Dr. Robert Brown",
        "Prof. Linda Green",
        "Dr. Sarah Clark",
        "Prof. David Miller",
        "Dr. Susan Lewis",
        "Prof. James Walker",
        "Dr. Patricia Robinson",
        "Prof. Mark Young",
        "Dr. Jennifer Hall",
        "Prof. Charles Allen",
        "Dr. Mary King",
        "Prof. Paul Wright",
        "Dr. Barbara Scott",
        "Prof. Laura Adams",
        "Dr. Richard Baker",
        "Prof. Elizabeth Nelson",
      ],
    };
  }
});
</script>
  

