import { Col } from "antd";
import React, { useContext } from "react";
import { Context } from "../../contexts/VehiclesContext";
import ConfigForm from "../ConfigForm";
import "./properties.scss";

const Properties = () => {
  const { vehicles } = useContext(Context);
  return (
    <div className="wrapper-properties">
      <Col span={24}>
        <h1>Vehicle Properties</h1>
      </Col>
      {vehicles.map(obj => (
        <Col span={24} key={obj._id}>
          <ConfigForm vehicleConfig={obj}></ConfigForm>
        </Col>
      ))}
    </div>
  );
};

export default Properties;
