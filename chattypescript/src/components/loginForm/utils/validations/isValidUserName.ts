

type ValidationProps = {
    userName: string
}

export const isValidUserName = ({userName}: ValidationProps) => {
    const nameRegex = /[^A-Z a-z0-9]/ ;
    return !nameRegex.test(userName);
}
