import Avatar from '@mui/material/Avatar';

interface IUserInfo {
    color: string
    user: string
}


export const UserInfo = (data: IUserInfo): JSX.Element => {
    return (
        <Avatar sx={{ 
            bgcolor: data.color,
            width: '100px',
            height: '100px',
            fontSize: 14,
            margin: '20px auto'
    
         }}>{data.user}</Avatar>
    )
}