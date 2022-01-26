import {Socket} from 'socket.io-client';

interface IMessage {
    message?: string;
  }


export const sendMessage = (data:IMessage, socket:Socket | null): void => {
    if (data.message && data.message.length < 200) {
        socket!.emit('message', data); 
    } 
};
