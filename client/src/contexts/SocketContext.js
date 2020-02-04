import React, { createContext } from "react";
import io from "socket.io-client";
export const SocketContext = createContext({});

export const SocketProvider = props => {
  const { children } = props;
  const socket = io("http://localhost:5000", {
    query: {
      id: process.env.REACT_APP_VEHICLE_ID,
      type: "Vehicle"
    }
  });

  const socketContext = {
    socket
  };

  return (
    <SocketContext.Provider value={socketContext}>
      {children}
    </SocketContext.Provider>
  );
};

export const { Consumer } = SocketContext;
