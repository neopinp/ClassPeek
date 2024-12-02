# Frontend
When `npm run dev` is run from root, this is loaded to your machine's **localhost** on port **8080**. However, to run this in a **production environment**, you need to run the `build` command to compile it to a `/dist` folder within the `frontend` directory. You then configure your web server to **serve the `index.html`** file within `dist/`. In full, that path would look something like `../Classpeek/frontend/dist/index.html`.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles to `/dist` for production
```
npm run build
```
