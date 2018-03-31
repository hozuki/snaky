import Message from "./Message";
import ResponseError from "./ResponseError";

export default interface ResponseMessage extends Message {

    result?: any;
    error?: ResponseError;
    id?: number | string | null;

}
