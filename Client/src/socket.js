import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
    auth: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    }
});

export default socket