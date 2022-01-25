import { IUser } from "../sendForm"

export const isValidPayload = ({userName, password}:IUser): boolean => {
    return (userName.trim().length > 2 && password.trim().length > 4) 
}