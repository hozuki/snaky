import Message from "./Message";

export default interface RequestMessage extends Message {

    method: string;
    params: any[] | object;
    id?: string | number | null;

}
