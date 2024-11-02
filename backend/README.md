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

## Database modifications
Upon making changes to schema.prisma, run the command to push your changes.
```
npx prisma db push
```
We can also run these commands to reset the database, or seed it with test data, or both.
```
npm run reset-db
npm run seed
npm run reset-and-seed
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
