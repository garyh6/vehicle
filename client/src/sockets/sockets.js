import axios from "axios";
import io from "socket.io-client";
const vehicleId = axios
  .get("/properties")
  .then(res => console.log("asdhaj"))
  .catch(err => {
    console.log("************ err", err);
  });

export const socket = io("http://localhost:5000", {
  query: {
    id: vehicleId,
    type: "Vehicle"
  }
});
