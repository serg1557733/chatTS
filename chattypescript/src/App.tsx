import './App.css';
import { LoginForm } from './components/loginForm/LoginForm';
import { ChatPage } from './components/chatPage/ChatPage';
import { useEffect, useState, ReactElement} from 'react';

const App = ():ReactElement => {

    const [token, setToken] = useState(localStorage.getItem('token'))


    useEffect(() => {
        if(token) {
            localStorage.setItem('token', token);  
        } 
        //clear after unmount
    }, [token])

    const handleToken = (token: string) => {
        setToken(token)
    }

    if (token) {
        return <ChatPage 
            token={token} 
            onExit={() =>{
                        localStorage.removeItem('token')
                        setToken('')
                    }}
                    /> 
        }

    return <LoginForm onSubmit = {handleToken}/>;
}

export default App;
