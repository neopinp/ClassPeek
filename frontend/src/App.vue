<template>
  <div id="app">
    <nav>
      <ul>
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/about">About</router-link>
        </li>
        <li>
          <router-link to="/subjects">Subjects</router-link>
        </li>
        <li>
          <router-link to="/majors">Majors</router-link>
        </li>
        <li>
          <router-link to="/api-test">API Test</router-link>
        </li>
        <li id="profileDropdown" @click="toggleDropdown">
          <router-link to="/profile" id="profileIcon">
            <font-awesome-icon :icon="['fas', 'user']" />
          </router-link>
          <ul v-if="isDropdownOpen" class="dropdown-menu">
            <li
              v-if="isAuthenticated && userRole === 'user'"
              @click="editProfile"
            >
              Edit Profile (Example User)
            </li>
            <li
              v-if="isAuthenticated && userRole === 'staff'"
              @click="editProfile"
            >
              Edit Profile (Staff)
            </li>
            <li v-if="isAuthenticated" @click="logout">Logout</li>
            <li v-else @click="redirectToSignIn">Sign In</li>
            <li v-if="!isAuthenticated" @click="createAccount">
              Create Account
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {
      isDropdownOpen: false as boolean,
      isAuthenticated: false as boolean,
      userRole: "guest" as "guest" | "user" | "staff",
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    viewProfile() {
      this.isDropdownOpen = false;
    },
    editProfile() {
      if (this.userRole === "user" || this.userRole === "staff") {
        this.$router.push("/profiled/edit");
      } else {
        alert("Please sign in to edit your profile");
      }
      this.isDropdownOpen = false;
    },
    logout() {
      this.isAuthenticated = false;
      this.userRole = "guest";
      this.isDropdownOpen = false;
      this.$router.push("/signin");
    },
    redirectToSignIn() {
      this.$router.push("/signin");
      this.isDropdownOpen = false;
    },
    signIn() {
      this.isAuthenticated = false;
      this.userRole = "user";
      this.isDropdownOpen = false;
      this.$router.push("/profile");
    },
    createAccount() {
      this.$router.push("/signup");
      this.isDropdownOpen = false;
    },
  },
  setRole(role: "guest" | "user" | "staff") {
    this.userRole = role;
    this.isAuthenticated = role !== "guest";
  },
});
</script>

<style>
* {
  box-sizing: border-box;
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

nav {
  background-color: #42b982;
  padding: 1rem;
  position: relative;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 0;
  padding: 0;
}

nav ul li a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav ul li a.router-link-exact-active {
  text-decoration: underline;
}

#profileIcon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}
#profileIcon.router-link-exact-active {
  color: green;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 1000;
  width: 150px;
  display: flex;
  flex-direction: column;
}
.dropdown-menu li {
  padding: 10px 20px;
  cursor: pointer;
  display: block;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}
</style>
