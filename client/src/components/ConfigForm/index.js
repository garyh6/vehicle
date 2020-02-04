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
  const parabola = x => fixed2(x + Math.random() * 10);
  const [subtract, setSubtract] = useState(false);
  const [tempX, setTempX] = useState(config.x);
  const [tempY, setTempY] = useState(config.temperature);
  const [coordinateX, setCoordinateX] = useState(config.x);
  const [coordinateY, setCoordinateY] = useState(config.y);

  const line = x => fixed2(0.1 * x + 11);

  // Emit changing temperature data
  // Emit changing x coordinate
  // Emit changing y coordinate

  useInterval(async () => {
    // Random Temp
    setTempY(parabola(tempX));

    if (coordinateX < 20) setSubtract(false);
    if (coordinateX > 800) setSubtract(true);

    // using tempX for simplicity
    setCoordinateX(tempX);
    setCoordinateY(line(tempX));

    socket.emit(
      "new vehicle data",
      {
        vehicleId: config._id,
        temperature: tempY,
        x: coordinateX,
        y: coordinateY,
        datetime: currentDatetime
      },
      (err, res) => {
        if (err) return console.log("new v data", err);
        console.log(res);
      }
    );

    if (subtract) {
      let val = Math.abs(fixed2(tempX - Math.random() * 10));
      setTempX(val);
    } else {
      let val = Math.abs(fixed2(tempX + Math.random() * 10));
      setTempX(val);
    }

    setConfig({
      ...config,
      temperature: tempY,
      x: coordinateX,
      y: coordinateY
    });

    try {
      const res = await axios({
        method: "patch",
        url: `http://${process.env.REACT_APP_DEV_SERVER}/properties/${vehicleConfig._id}/internal`,
        data: {
          temperature: tempY,
          x: coordinateX,
          y: coordinateY
        }
      });
      console.log("************ updated res", res);
    } catch (err) {
      return console.log("************ err", err);
    }
  }, 10000);
  // have a button that can change speed
  socket.removeAllListeners("patch property to vehicle");
  socket.on(
    "patch property to vehicle",
    async ({ newKey: key, newValue: value, id }) => {
      console.log("************ got some data", key, value, id);
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
          console.log("************1st res", res);
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
    console.log("************ prop to delete", key, origin, id);
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
        console.log("************ deleted", res);
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
