# Backend 

## Project setup
First you run the mandatory npm install to install all needed packages if you already have not done so. After this, we run a command that generate a Prisma client which allows our backend to communicate with the database we have setup.
```
npm install
npx prisma generate
```

## Database connection
For development purposes, our .env file is not .gitignored so it is included within the repo. Normally, this is a hidden file that is generated via Prisma. You go into this file and you specifiy the DATABASE_URL that we connect to. If you are hosting the webpage on a web server, 
```
// "postgresql(our database)://username:password@hostaddress:port[default port for postgree is 5432]/schema[here 'classpeek']?schema=public"
DATABASE_URL="postgresql://testuser:testpassword@10.11.29.118:5432/classpeek?schema=public"
```

## Database modifications
Upon making changes to schema.prisma, run the command to push your changes. However, this is more for quick changes. If you want a more reliable mode that has fall back versions, use primsa migrate instead.
```
npx prisma db push
```
We can also run these commands to reset the database, or seed it with test data, or both.
```
npm run reset-db
npm run seed
npm run reset-and-seed
```

### Running the backend
In order to run our express.js backend, we use the following commands depending on your intent. If you want an environment to test on your localhost, use `run dev`. If you want to build for production on your web server, use `run build`.
```
npm run dev (localhost:3000)
npm run build (builds to /dist)
```

If you want to launch the server, there are two ways. Either you can run the regular `start` to run the server within a terminal, or you can use `pm2-start`
```
npm run start (runs within terminal)
npm run pm2-start (starts within a pm2 daemon)
```
