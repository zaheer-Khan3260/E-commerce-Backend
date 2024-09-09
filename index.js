import express from "express";
import cluster from "cluster";
import os from "os";
import connectDatabase from "./src/db/index.js";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from 'cors';



dotenv.config({
    path: './env'
});

export const app = express();


const CPU = os.cpus().length;
    if(cluster.isPrimary){
        for(let i = 0; i < CPU; i++){
            cluster.fork();
        }
    }else{

        connectDatabase()
        .then(() => {
            console.log("PORT:", process.env.PORT );
            app.listen(process.env.PORT || 5000, () => {
                console.log(`Server is running at port : ${process.env.PORT}`);
            })
        })
        .catch((err) => {
            console.log("MongoDB connection failed !!!", err);
        })
        
    }

    const corsOptions = {
        origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
        allowedHeaders: "Content-Type, Authorization, X-Requested-With",
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
    
    app.use(cors(corsOptions));
    app.use(express.json())
    app.use(express.urlencoded({extended: true}));
    app.use(express.static("public"))
    app.use(cookieParser());




import userRouter from "./src/routes/user.routes.js"



app.use("/", userRouter);
