import Avatar from '@mui/material/Avatar';



export interface IUser {
    _id: number | null | undefined;
    userName: string
    password: string 
    color: string
    id: string
    isAdmin: boolean
    isMutted:boolean
    isBanned:boolean
}

interface IUserInfo {
    user?: IUser
    color?: string
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