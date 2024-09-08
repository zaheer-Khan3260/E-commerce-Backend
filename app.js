import express from 'express';
import cors from 'cors';
import { app } from './index.js';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

dotenv.config({
    path: './env'
});

const corsOptions = {
    origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
    preflightContinue: false,
    optionsSuccessStatus: 204
}

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json( {limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser());


