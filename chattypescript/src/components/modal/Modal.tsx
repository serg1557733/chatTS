import Alert from '@mui/material/Alert';
import {FC, ReactElement } from 'react';

interface ModalFormProps {
    text: string
    propDisplay: string
}

export const Modal:FC<ModalFormProps> = ({text, propDisplay}):ReactElement  => {
    return <Alert 
                severity="error"
                sx={{
                    display: propDisplay,
                }}>
                {text}
            </Alert>
}