import express from "express";
import cluster from "cluster";
import os from "os";
import connectDatabase from "./src/db/index.js";
import dotenv from "dotenv";


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
        app.get('/',(req, res) => {
            res.send('Hello World!');
        })
        
        connectDatabase()
        .then(() => {
            app.listen(process.env.PORT || 5000, () => {
                console.log(`Server is running at port : ${process.env.PORT}`);
            })
        })
        .catch((err) => {
            console.log("MongoDB connection failed !!!", err);
        })
        
    }


