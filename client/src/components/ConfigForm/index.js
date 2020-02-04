import { Form, Input, Row } from "antd";
import axios from "axios";
import React, { useContext, useState } from "react";
import { SocketContext } from "../../contexts/SocketContext";
import { getCurrentDatetime } from "../../utils/getCurrentDatetime";
import { useInterval } from "../../utils/useInterval";
const ConfigForm = ({ vehicleConfig }) => {
  // todo need to change db schema to be jsut one properties
  const { socket } = useContext(SocketContext);
  if (!vehicleConfig.properties) vehicleConfig.properties = {};
  const fixedProps = Object.keys(vehicleConfig);
  fixedProps.splice(fixedProps.indexOf("properties"), 1);

  const [config, setConfig] = useState(vehicleConfig);

  const fixed2 = num => {
    return Math.round(num * 100) / 100;
  };

  const currentDatetime = getCurrentDatetime();
  const tempFn = x => fixed2(x + Math.random());
  const [subtract, setSubtract] = useState(false);
  const [temp, setTemp] = useState(config.temperature);
  const [coordinateX, setCoordinateX] = useState(config.x);
  const [coordinateY, setCoordinateY] = useState(config.y);

  const line = x => fixed2(0.1 * x + 40);

  // Emit changing temperature data
  // Emit changing x coordinate
  // Emit changing y coordinate

  useInterval(async () => {
    // Random Temp
    setTemp(tempFn(temp));

    if (coordinateX < 20) setSubtract(false);
    if (coordinateX > 800) setSubtract(true);

    // using tempX for simplicity
    setCoordinateX(temp);
    setCoordinateY(line(temp));

    socket.emit(
      "new vehicle data",
      {
        vehicleId: config._id,
        temperature: temp,
        x: coordinateX,
        y: coordinateY,
        datetime: currentDatetime
      },
      err => {
        if (err) return console.log("new v data", err);
      }
    );

    if (subtract) {
      let val = Math.abs(fixed2(temp - Math.random() * 50));
      setTemp(val);
    } else {
      let val = Math.abs(fixed2(temp + Math.random() * 50));
      setTemp(val);
    }

    setConfig({
      ...config,
      temperature: temp,
      x: coordinateX,
      y: coordinateY
    });

    try {
      const res = await axios({
        method: "patch",
        url: `http://${process.env.REACT_APP_DEV_SERVER}/properties/${vehicleConfig._id}/internal`,
        data: {
          temperature: temp,
          x: coordinateX,
          y: coordinateY
        }
      });
    } catch (err) {
      return console.log("************ err", err);
    }
  }, 500);
  // have a button that can change speed
  socket.removeAllListeners("patch property to vehicle");
  socket.on(
    "patch property to vehicle",
    async ({ newKey: key, newValue: value, id }) => {
      // patch data then
      if (id === vehicleConfig._id) {
        try {
          const res = await axios({
            method: "patch",
            url: `http://${process.env.REACT_APP_DEV_SERVER}/properties/${vehicleConfig._id}`,
            data: {
              key,
              value
            }
          });
          let newConfig = { ...config };
          newConfig.properties[key] = value;
          setConfig(newConfig);

          socket.emit("acknowledge update", {
            id,
            key,
            value,
            msg: "success"
          });
        } catch (err) {
          return console.log("************2nd err", err);
        }
      } else {
        console.log("dont update");
      }
    }
  );
  // i really should chagne the vehicle schema/db
  socket.removeAllListeners("delete property to vehicle");
  socket.on("delete property to vehicle", async ({ key, id, origin }) => {
    // delete data
    if (id === vehicleConfig._id) {
      try {
        const res = await axios({
          method: "delete",
          url: `http://${process.env.REACT_APP_DEV_SERVER}/properties/${vehicleConfig._id}`,
          data: {
            key
          }
        });
        let newConfig = { ...config };
        delete newConfig.properties[key];
        setConfig(newConfig);

        socket.emit("acknowledge delete", {
          id,
          key,
          origin,
          msg: "success"
        });
      } catch (err) {
        return console.log("************2nd err", err);
      }
    } else {
      console.log("dont update");
    }
  });

  const formItemLayout = {
    labelCol: {
      xs: { span: 3 },
      sm: { span: 3 }
    },
    wrapperCol: {
      xs: { span: 18 },
      sm: { span: 18 }
    }
  };

  return (
    <Row span={24} className="wrapper-form">
      <Form {...formItemLayout}>
        {fixedProps.map(key => (
          <Form.Item key={key} label={key} className="form-item-group">
            <Input disabled value={config[key]}></Input>
          </Form.Item>
        ))}

        {Object.keys(config.properties)
          .sort()
          .map((key, idx) => {
            return (
              <Form.Item label={key} key={key} className="form-item-group">
                <Input disabled value={config.properties[key]}></Input>
              </Form.Item>
            );
          })}
      </Form>
    </Row>
  );
};

export default ConfigForm;
