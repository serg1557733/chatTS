interface Iitem {
    createDate:string
}

export const dateFormat = (item:Iitem): {} => {

    const res = item.createDate.split('T');
    const date = {
        year : res[0],
        time : res[1].slice(-13, -5)
    }
    return date;
}  