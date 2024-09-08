import express from "express";
import cluster from "cluster";
import os from "os";

const port = 3000
const CPU = os.cpus().length;


if(cluster.isPrimary){
    for(let i = 0; i < CPU; i++){
        cluster.fork();
    }
}else{
    const app = express();
    app.get('/',(req, res) => {
        res.send('Hello World!');
    })
    
    
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${port}`);
    })
    
}
