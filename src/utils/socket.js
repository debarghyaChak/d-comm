import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
  transports: ["websocket"],
});

// ✅ Ensure it's only accessible in the browser (prevents Next.js SSR errors)
if (typeof window !== "undefined") {
  window.socket = socket;
}

export default socket;
