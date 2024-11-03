/* font-awesome.ts
   Global Profile Icon */

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { App } from 'vue';

// Add icons to the library
library.add(faUser);

export default {
  install(app: App) {
    app.component('font-awesome-icon', FontAwesomeIcon);
  },
};
