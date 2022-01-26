import TextareaAutosize from '@mui/material/TextareaAutosize';
import Button from '@mui/material/Button';
import { useState, FormEvent} from 'react';
import Box from '@mui/material/Box';
import {Socket} from 'socket.io-client';
import { handleSubmit } from '../../loginForm/utils/handleSubmit';


interface ISocketData {
    userName?: string;
    message?: string;
}

interface IUser {
    userName: string
    password: string
    isAdmin?: boolean
    isMutted?:boolean
    isBanned?:boolean
}


interface MessageFormArgs {
    data: IUser;
    sendMessage:(data:ISocketData, socket?:Socket | null) => void
    children?: any
}




export const MessageForm = ({sendMessage, data}: MessageFormArgs):JSX.Element => {

    const [message, setMessage] = useState({message: ''});

    console.log(data.isMutted)
    const handleSubm = (e: FormEvent, message: ISocketData): void => {
        e.preventDefault()
        sendMessage(message);
        setMessage({message: ''});
    
    }

    return (
        <Box 
            component="form" 
            onSubmit = {(e:FormEvent) => handleSubm(e, message)}
                sx={{
                    display: 'flex',
                    margin: '20px 5px'
                }}>
        
                    <TextareaAutosize
                        id="outlined-basic" 
                        value={message.message}
                        placeholder='type you message...'
                        minRows={3}
                        maxRows={4}
                        onKeyPress={(e) => {
                            if (e.key === "Enter")   {
                                e.preventDefault();
                                sendMessage(message);
                                setMessage({message: ''});
                            }
                        }}
                        onChange={e => setMessage({...message, message: e.target.value})}
                        style={{
                            width: '80%',
                            resize: 'none',
                            borderRadius: '4px',
                        }}
                        /> 
                    <Button 
                    variant="contained" 
                    type='submit'
                    disabled={data.isMutted}
                    style={{
                        width: '20%',
                    }}
                    >Send</Button>
        </Box>            
    )

}