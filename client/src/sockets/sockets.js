import io from "socket.io-client";
export const socket = io("http://localhost:5000", {
  query: {
    id: process.env.VEHICLE_ID,
    type: "Vehicle"
  }
});
