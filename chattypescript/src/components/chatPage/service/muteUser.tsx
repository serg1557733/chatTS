interface IUser {
    userName: string
    password: string
}

export interface ISocket {
    emit:(event: string, data: any) => void ;
}

export const muteUser = (user: IUser, prevStatus: boolean, socket: ISocket): void => {
    socket.emit('muteUser', {user, prevStatus} );
}