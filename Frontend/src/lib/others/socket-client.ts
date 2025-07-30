import { baseUrl } from "./base-url";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(baseUrl);
export default socket;
