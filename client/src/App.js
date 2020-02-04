import { Col, Row } from "antd";
import "antd/dist/antd.css";
import React from "react";
import "./App.css";
import Properties from "./components/Properties";
import { SocketProvider } from "./contexts/SocketContext";
import { Provider } from "./contexts/VehiclesContext";
function App() {
  return (
    <div className="App">
      <Provider>
        <SocketProvider>
          <Row span={24}>
            <Col span={24}>
              <Properties></Properties>
            </Col>
          </Row>
        </SocketProvider>
      </Provider>
    </div>
  );
}

export default App;
