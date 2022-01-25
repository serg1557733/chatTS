import { IUser } from "../../loginForm/utils/sendForm";
import { ISocket } from "./muteUser";

export const banUser = (user: IUser, prevStatus: boolean, socket: ISocket): void  => {
    socket.emit('banUser', {user, prevStatus} );
}