import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import React, { useState, useEffect, FormEvent, ReactEventHandler } from 'react';
import { Modal } from '../modal/Modal';
import {handleSubmit} from './utils/handleSubmit'

interface IUser {
    userName: string
    password: string
}

interface LoginFormProps { 
    onSubmit: (token: string) => void 
};

export const LoginForm = ({onSubmit}: LoginFormProps) => {

    const [userData, setUserdata] = useState({userName:'', password: ''});
    const [textModal, setTextModal] = useState('')
    const [display, setDisplay] = useState('none');


    const POST_URL =  process.env.REACT_APP_POST_URL || 'http://localhost:5000/login';

    const changeTextModal = (value: string) => {
        setTextModal(value)
    }
    const changeDisplay= (value: string) => {
        setDisplay(value)
    }
    const changeUserData= ({}:IUser) => {
        setUserdata({} as IUser)
    }

    useEffect(()=>{
        return () => {
            setUserdata({userName:'', password: ''})
        }
    }, [])


    return (
        <Container maxWidth="xs">
            <Box
                component="form" 
                onSubmit={(e:FormEvent<HTMLFormElement>) => handleSubmit({changeTextModal, changeDisplay, changeUserData,onSubmit, e, POST_URL, userData})}
                sx={{
                    marginTop: 40,
                    display: 'flex',
                    flexDirection: 'column',
                }}
                >
                <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="userName"
                        label="user name"
                        name="userName"
                        autoComplete="email"
                        autoFocus
                        value={userData.userName}
                        onChange={(e) => {
                        setUserdata({...userData, userName: e.target.value})
                        setDisplay('none')
                    }}
                />
                <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={userData.password}
                        onChange ={(e) => setUserdata({...userData, password: e.target.value})}
                />
                <Modal 
                    text={textModal}
                    propDisplay = {display}
                
                ></Modal>
                <Button 
                    type="submit"
                    variant="contained"
                    fullWidth>Login
                </Button>
            </Box>
        </Container>
    )
}