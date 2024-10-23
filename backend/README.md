# Backend (http://localhost:3000)

## Project setup
```
npm install
```

## Database connection
Create a file called .env if you don't have one and paste the following line into it. Note that this is horrible security practice
```
DATABASE_URL="postgresql://testuser:testpassword@10.11.29.118:5432/classpeek?schema=public"
```


### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Starts server in production mode
```
npm start
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
