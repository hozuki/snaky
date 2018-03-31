import ServerRpcContext from "./ServerRpcContext";

type MethodHandler = (context: ServerRpcContext) => void;

export default MethodHandler;
