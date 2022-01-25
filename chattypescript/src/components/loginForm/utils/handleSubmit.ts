import { IUser } from "./sendForm";
import { FormEvent } from "react";
import { isValidUserName } from "./validations/isValidUserName";
import { isValidPayload } from "./validations/isValidPayload";
import { sendForm } from "./sendForm";

interface HandleSubmitArgs {
    e:FormEvent<HTMLFormElement>;
    POST_URL: string;
    userData: IUser;
    onSubmit: (token: string) => void 
    changeTextModal: (value: string) => void;
    changeDisplay: (value: string) => void;
    changeUserData: ({}:IUser) => void;
}
interface ResponseData {
    message: string
    token?: string
}


export const handleSubmit = async ({changeTextModal, changeDisplay, changeUserData,onSubmit, e, POST_URL, userData}: HandleSubmitArgs) => {
    e.preventDefault(); 
    if(isValidPayload({...userData}) && isValidUserName({...userData})){
        const data: ResponseData | null = await sendForm(POST_URL, userData);
        if(!data) {
            return
        }
        const token = data.token;
        const message = data.message;
        if(token){
            onSubmit(token);     
        }
        changeTextModal(message)
        changeDisplay('block')
        changeUserData({userName:'', password: ''});
        
    } else {
        changeTextModal('too short or using special symbols')
        changeDisplay('block')
    }
}