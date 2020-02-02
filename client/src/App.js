import { Col, Row } from "antd";
import "antd/dist/antd.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";
import Properties from "./components/Properties";

function App() {
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => {
    axios
      .get("/properties")
      .then(res => setVehicles(res.data))
      .catch(err => {
        console.log("************ err", err);
      });
  }, []);
  console.log("************ vehicles", vehicles);

  return (
    <div className="App">
      <Row span={24}>
        <Col span={24}>
          <Properties vehicles={vehicles}></Properties>
        </Col>
      </Row>
    </div>
  );
}

export default App;
