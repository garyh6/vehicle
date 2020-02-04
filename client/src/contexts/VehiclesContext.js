import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
export const Context = createContext({});

export const Provider = props => {
  const { children } = props;
  const [vehicles, setVehicles] = useState([]);

  const getVehicles = async () => {
    try {
      const res = await axios.get(
        `http://${process.env.REACT_APP_DEV_SERVER}/properties`
      );
      setVehicles(res.data);
    } catch (err) {
      console.log("************ err", err);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  const vehiclesContext = {
    vehicles,
    setVehicles
  };

  return (
    <Context.Provider value={vehiclesContext}>{children}</Context.Provider>
  );
};

export const { Consumer } = Context;
