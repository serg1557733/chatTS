import { useEffect, useState, useMemo, useRef, Fragment} from 'react';
import { MessageForm } from './messageForm/MessageForm';
import {Button,Avatar, Box, Container} from '@mui/material';
import { UserInfo } from './userInfo/UserInfo';
import { dateFormat } from './utils/dateFormat';
import {io, Socket} from 'socket.io-client';
import './chatPage.scss';
import { scrollToBottom } from './utils/scrollToBottom';
import { banUser } from './service/banUser';
import { muteUser } from './service/muteUser';
import {sendMessage} from './service/sendMessage';
import {IUser} from './userInfo/UserInfo';


interface ChatPageArgs {
    onExit:() => void
    token: string
}

// interface ServerToClientEvents {
//     noArg: () => void;
//     basicEmit: (a: number, b: string, c: Buffer) => void;
//     withAck: (d: string, callback: (e: number) => void) => void;
//   }
  
//   interface ClientToServerEvents {
//     hello: () => void;
//   }
  
interface IMessages {
    message?: string;
    userName?: string
    text?: string
    createDate: Date
    _id?:string
}


export const ChatPage = ({onExit, token}: ChatPageArgs) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<IMessages[]>([])
    const [user, setUser] = useState<IUser>({} as IUser)
    const [usersOnline, setUsersOnline] = useState<IUser[]>([])
    const [allUsers, setAllUsers] = useState<IUser[]>([])
    
    const randomColor = require('randomcolor'); 
    //const endMessages = useRef(null);
    const endMessages = useRef<HTMLDivElement | null>(null);
    //const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

    console.log('user chat', user.isMutted)
    useEffect(() => {
        if(token){
            
            try {
                setSocket(io( 
                        process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', 
                        {auth: {token}})
                        )
            } catch (error) {
                console.log(error)
            } 
        }
    }, [token])

    const unsub = useEffect(() => {
        if(socket){
            socket.on('connected', (data) => {
                setUser(data);
                }).on('error', (e) => {
                console.log('On connected', e)
            }); 
            socket.on('allmessages', (data) => {
                    setMessages(data)
                    }).on('error', (e) => {
                    console.log('allmessages', e)
            }); 
            socket.on('usersOnline', (data) => {
                setUsersOnline(data)
                }).on('error', (e) => {
                console.log(e)
            });  
            socket.on('allDbUsers', (data) => {
                setAllUsers(data);
                }).on('error', (e) => {
                console.log(e)
            }); 
            socket.on('disconnect', (data) => {
                if(data === 'io server disconnect') {
                   socket.disconnect();
                   onExit(); 
                } 
                }).on('error', (e) => {
                console.log('error token', e)
            });  
            socket.on('message', (data) => {
                setMessages((messages) => [...messages, data])
                }).on('error', (e) => {
                console.log(e)
            }); 
             
        }

        // return () => {
        //     socket.off('connected');
        //     socket.off('allmessages');
        // }
    }, [socket])

    useEffect(() => {
        scrollToBottom(endMessages)
      }, [messages]);

    let userColor = useMemo(() => randomColor(),[]);

    return (
        <Container maxWidth="lg">
            <Box 
                sx={{
                    display: 'flex',
                    height: '100vh'
                }}>
                <Box
                sx={{
                    display: 'flex',
                    flexGrow:'2',
                    flexDirection: 'column',                    
                }}>
                    <Box                 
                    className='messageBox'
                    sx={{
                        display: 'flex',
                        flexGrow:'2',
                        flexDirection: 'column',
                        overflow: 'scroll',
                        height: '100vh'  
                    }}>                     
                        {
                        messages.map((item, i) =>
                        <Fragment key={i} >
                            <Avatar 
                                sx={
                                    (item.userName == user.userName)
                                    ? 
                                    {
                                        alignSelf: 'flex-end',
                                        fontSize: 10,
                                        width: '60px',
                                        height: '60px',
                                        color:'black',
                                        backgroundColor: userColor
                                    }
                                    :
                                    {
                                        backgroundColor:  (usersOnline.map(current =>{
                                            if(item.userName == current.userName ) {
                                                return current.color
                                            }
                                          
                                        } )),
                                        fontSize: 10,
                                        width: '60px',
                                        height: '60px',
                                        color:'black'
                                    }
                                    }> 
                                    {item.userName}
                            </Avatar>   
                            <div 
                                key={item._id}
                                className={ 
                                (item.userName == user.userName)
                                ? 
                                'message myMessage' 
                                :
                                'message'}
                                >
                                    <p>{item.text}</p>  
                                    <div
                                     style={{fontStyle:'italic',
                                            color: 'grey',
                                            fontSize: 14}}>
                                          
                                    </div> 
                                    <div 
                                    style={{fontStyle:'italic',
                                            fontSize: 12,
                                            color: 'grey'}}>
                                           
                                    </div>
                            </div>
                     
                        </Fragment>
                        )}
                        <div ref={endMessages}></div>
    
                        </Box>
                            <MessageForm
                                    data = {user} 
                                    sendMessage = {(data) => {
                                                    sendMessage(data, socket)
                                                }}>
                            </MessageForm>
                        </Box>

                        <Box
                        className='usersBox'
                        sx={{
                            overflow: 'scroll',  
                        }}>
                        <Button 
                                sx={{margin:'10px 5px'}}
                                variant="outlined"
                                onClick={(e)=> {
                                        socket!.disconnect()
                                        onExit()
                                        }}>
                                Logout
                        </Button>

                        <UserInfo
                        color={userColor}/>
                            {
                                user.isAdmin 
                                && socket
                                ? 
                                allUsers.map((item) =>
                                <div 
                                    key={item._id}
                                    className='online'>
                                    <div style={
                                        {color: (usersOnline.find(current =>item.userName == current.userName)?.color)}}>{item.userName}</div>
                                        <div>
                                            <Button
                                                variant="contained"
                                                onClick={()=>{
                                                    muteUser(item, item.isMutted, socket)
                                                    }}
                                                sx={{
                                                    margin:'3px',
                                                    height: '25px'
                                                }}>
                                                    {item.isMutted
                                                    ? 
                                                    'unmute'
                                                    : 'mute'}
                                            </Button>

                                            <Button
                                                variant="contained"
                                                onClick={()=>{
                                                    banUser(item, item.isBanned, socket)
                                                }}
                                                sx={{
                                                    margin:'3px',
                                                    height: '25px'
                                                }}>
                                                    {item.isBanned
                                                ? 'unban'
                                                : 'ban'}
                                            </Button>

                                        </div>
                                {
                                usersOnline.map((user, i) =>{
                                                    if(item.userName == user.userName){
                                                    return <span key={i} style={{color: 'green'}}>online</span>
                                                    }
                                                })
                                }
                                </div>) 
                                :
                                usersOnline.map((item, i) =>
                                        <div 
                                            key={i}
                                            className='online'>  
                                            <div style={{color: item.color}}>
                                                {item.userName}
                                            </div>
                                            <span style={{color: 'green'}}>
                                                online
                                            </span>
                                        </div>)
                            }
                </Box>
            </Box>
        </Container>
    )
}