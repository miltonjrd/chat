const { PrismaClient } = require('@prisma/client');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('./middlewares/auth');

import Message from './interfaces/Message';
import User from './interfaces/User';

const prisma = new PrismaClient();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

const getMessages = async () => {
  const messages = await prisma.message.findMany();
  return messages;
};

const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

io.on('connection', (socket:any) => {
  console.log('Conectado:', socket.id);

  getMessages().then(messages => socket.emit('get messages', messages));
  getUsers().then(users => socket.emit('get users', users));

  socket.on('error', () => console.log('ERRO DOS INFERNOS'))

  socket.on('send message', async (message: Message) => {
    const user = await auth(socket.handshake.auth?.token);
    const res = await prisma.message.create({
      data: {...message, authorId: user.id},
    });
  });

  socket.on('user login', async (credentials:{name: string, password: string}) => {
    const user = await prisma.user.findFirst({
      where: {
        name: credentials.name
      }
    });

    const authenticated = await bcrypt.compare(credentials.password, user.password);
    if (authenticated) console.log('autenticado')
    else console.log('nao autenticado');

    const token = user ? 
    jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '3600s' }) :
    false;
    
    socket.emit(
      'user login response', 
      { user, token }
    );
  })

  socket.on('user register', async (credentials:{name: string, password: string}) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(credentials.password, salt);
    const user = await prisma.user.create({
      data: {
        name: credentials.name,
        password
      }
    });
    console.log(user);
  });
});

server.listen(5000, () => {
  console.log('rodando na porta 5000')
});