
interface IMessage {
    message?: string;
  }

interface ISocket {
    emit:(event: string, data: any) => void ;
}

export const sendMessage = (data:IMessage, socket:ISocket): void => {
    if (data.message && data.message.length < 200) {
        socket.emit('message', data); 
    } 
};
