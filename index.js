import express from 'express';
import db from "./config/Database.js"
// import Users from './models/UserModel.js';
import router from './routes/index.js';
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config();

//import routes from './routes';
const app = express();

// cek koneksi database
try {
    await db.authenticate();
    console.log('Database connected...');
    // migrate Users
    // await Users.sync({ force: true, logging: console.log });
} catch (error) {
    console.log(error)
}

// middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(cookieParser());
app.use(express.json())
app.use(router);

// run app
app.listen(8000, () => console.log('Server running at port 8000'));
