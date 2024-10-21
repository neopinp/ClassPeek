# Classpeek
The purpose of ClassPeek is to create an interactive platform for students and instructors to share and manage educational content, facilitating discussions and collaboration around courses. The application will provide features such as course management, file sharing, and discussion boards in a user-friendly, dynamic web environment.

## Installation
First, make sure that you have VSCode and node.js installed on your device. If already, make sure that your node.js installation is at the latest (at the time of creating this, 20.18.0) and for npm as well. Make sure that you're in the root directory for the file where you cloned the repository(i.e. .../Classpeek), then run these in the terminal to install the dependicies for Classpeek on your device.
```
npm install -g typescript (run in root)
npm install -g @vue/cli (run in root)
npm install express cors (run in /backend)
npm install -D concurrently (run in root)
```

These commands install prisma so we can interact with our PostgreSQL database. First **make sure that you are running this from the backend!**
```
cd backend
npm install prisma @prisma/client typescript
npx prisma generate
```

## Running the server
Each of the commands starts up the applcation on your localhost (127.0.0.1) address. The front end runs on the 8080 port, and the backend runs on the 3000 port.

### Root
First make sure that you are running this from the root diectory (.../Classpeek), then run them based on what you are trying to do.
```
npm run dev (from root, both backend and frontend)
npm run client (from root, runs frontend)
npm run server (from root, runs backend)
npm run build (from root, builds and runs frontend & backend for 'production')
npm run start (from root, starts backend for 'production')
```


### Frontend
Works only with frontend. So make sure from the root you cd into the `frontend` folder.
```
npm run serve (cd frontend, runs frontend)
```

### Backend
```
npm run dev ((run in /backend))
npx prisma generate (Needed everytime you change the schema)
```
