import { Socket } from 'socket.io-client';
import { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import {Server as SocketServer } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
const express = require('express');
const app = express()
const cors = require("cors");
const http = require('http'); //create new http
const mongoose = require('mongoose');
// const { Server: SocketServer} = require("socket.io");
const User = require('./db/models/User');
const Message = require('./db/models/Message');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // add dotnv for config

export interface IUser {
    _id: number | null | undefined;
    userName: string
    password: string 
    color: string
    id: string
    isAdmin: boolean
    isMutted:boolean
    isBanned:boolean
}

const server: Server = http.createServer(app);

app.use(cors());

app.use(express.json());

const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:3000" //client endpoint and port
    }
});


const PORT = 5000;
const TOKEN_KEY = process.env.TOKEN_KEY || 'rGH4r@3DKOg06hgj'; 
const HASH_KEY = 7;


const generateToken = (id: string, userName: string, isAdmin: boolean) => {
    const payload = {
        id,
        userName,
        isAdmin
    }
    return jwt.sign(payload, TOKEN_KEY);
}

const isValidUserName = (userName: string): boolean => {
    const nameRegex = /[^A-Za-z0-9]/ ;
    return (!nameRegex.test(userName) && userName.trim().length > 2);
}

// const getAllDbUsers = async (socket) => {
//     const usersDb = await User.find({})
//     socket.emit('allDbUsers', usersDb) 
// }
const getOneUser = async (userName: string) => {
    const userInDb = await User.findOne({userName});
    return userInDb;
}

app.post('/login', async (req: Request, res: Response) => {
    try {
        const {userName,password} = req.body;
        if (!isValidUserName(userName)){
            return res.status(400).json({message: 'Invalid username'})
        }
        const dbUser = await getOneUser(userName)

        if (dbUser?.isBanned){
            return res.status(401).json({message: 'Your account has been banned!!!'})
        }
        const hashPassword = await bcrypt.hash(password, HASH_KEY);
        if (!dbUser) {
            const user = new User({
                userName,
                hashPassword,
                isAdmin: !await User.count().exec(),
                isBanned: false,
                isMutted: false
            });

            await user.save()

            return res.json({
                token: generateToken(user.id, user.userName, user.isAdmin)
            });
        }

        if (dbUser && !bcrypt.compareSync(password, dbUser.hashPassword)){
            return res.status(400).json({message: 'Invalid credantials'})
        }
        res.json({
            token:  generateToken(dbUser.id, dbUser.userName, dbUser.isAdmin)
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({message: `Error ${e}`});
    }
})


io.use(async (socket , next) => {
    const token: string = socket.handshake.auth.token;
    const sockets = await io.fetchSockets();



    if(!token) {
        socket.disconnect();
        return;
    }

    const usersOnline: Array<IUser> = [];

    sockets.map((sock) => {
        usersOnline.push(sock.data.user);
    }) 

    try {
        const user = jwt.verify(token, TOKEN_KEY);
        const userName = user.userName;
        const dbUser = await getOneUser(userName);

        if(dbUser.isBanned){
            socket.disconnect();
            return;
        }
        socket.data.user = user;
        // socket.user.color = randomUserColor;
        const exist = sockets.find((current) => current.data.user.userName == socket.data.user.userName)

        if(exist) {  //&& !user.isAdmin  - add for two or more admins 
            console.log(exist.data.userName, 'exist twice entering...')   
            exist.disconnect(); 
        } 
    } catch(e) {
        console.log(e);
        socket.disconnect();
    }
    next();
});

io.on("connection", async (socket) => {
    const userName = socket.data.user.userName;
    const sockets = await io.fetchSockets();
    const dbUser = await getOneUser(userName);

    io.emit('usersOnline', sockets.map((sock) => sock.data.user)); // send array online users  
    socket.emit('connected', dbUser); //socket.user
   
    if(socket.data.user.isAdmin){
        const usersDb = await User.find({})
        socket.emit('allDbUsers', usersDb) ; 
    }//sent all users from db to admin

    const messagesToShow = await Message.find({}).sort({ 'createDate': -1 }).limit(20);

    socket.emit('allmessages', messagesToShow.reverse());
    socket.on("message", async (data) => {
        const dateNow = Date.now(); // for correct working latest post 
        const post = await Message.findOne({userName}).sort({ 'createDate': -1 })
        const oneUser = await getOneUser(userName);
      
        if(oneUser.isMutted || !post){
            return;
        }

        if(((Date.now() - Date.parse(post.createDate)) < 150)){
            return;
        }

        // if(!oneUser.isMutted && post){
        // if(((Date.now() - Date.parse(post.createDate)) > 150)){//change later 15000  
        const message = new Message({
                text: data.message,
                userName: userName,
                createDate: Date.now()
            });
            try {
                await message.save(); 
            } catch (error) {
                console.log('Message save to db error', error);   
            }
            io.emit('message', message);
        // }
        // } 
    });
    
    try {
        socket.on("disconnect", async () => {
            const sockets = await io.fetchSockets();
            io.emit('usersOnline', sockets.map((sock) => sock.data.user));
            console.log(`user :${socket.data.user.userName} , disconnected to socket`); 
        });
            console.log(`user :${socket.data.user.userName} , connected to socket`); 
        
        socket.on("muteUser",async (data) => {
            if(!socket.data.user.isAdmin){
                return;
            }
                    const {user, prevStatus} = data;
                    const sockets = await io.fetchSockets();
                    const mute = await User.updateOne({userName : user.userName}, {$set: {isMutted :!prevStatus}});
                    const usersDb: IUser = await User.find({});
                    socket.emit('allDbUsers', usersDb);
                    const exist = sockets.find(current => current.data.user.userName === user.userName)
                    const dbUser: IUser = await getOneUser(user.userName);
                   if(exist){
                       exist.emit('connected', dbUser); 
                    }
           });

        socket.on("banUser",async (data) => {
            if(!socket.data.user.isAdmin){
                return;
            }
                const {user, prevStatus} = data;
                const sockets = await io.fetchSockets();
                const ban = await User.updateOne({userName : user.userName}, {$set: {isBanned:!prevStatus}});
                const usersDb: IUser = await User.find({})
                socket.emit('allDbUsers', usersDb) 
                const exist = sockets.find( current => current.data.user.userName == user)
                
                if(exist){
                    exist.disconnect();  
                }
           });
    } catch (e) {
        console.log(e);
    }
});


//server and database start
const start = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/chat')
            .then(() => console.log(`DB started`))
        server.listen(PORT, () => {
            console.log(`Server started. Port: ${PORT}`);
        })
    } catch (e) {
        console.log('Error server strat' , e);
    }
}

start();