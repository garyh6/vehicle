import { Form, Input, Row } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { socket } from "../../sockets/sockets";
import { getCurrentDatetime } from "../../utils/getCurrentDatetime";
import { useInterval } from "../../utils/useInterval";
const ConfigForm = ({ vehicleConfig }) => {
  // todo need to refactor - init socket from app, change db schema to be jsut one properties (relational db makes sense)

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
  const [tempX, setTempX] = useState(config.x || 400);
  const [tempY, setTempY] = useState(config.temperature);
  const [coordinateX, setCoordinateX] = useState(config.x);
  const [coordinateY, setCoordinateY] = useState(config.y);

  const polynomial = x =>
    fixed2(-1256 + 10.8 * x - 0.022 * x ** 2 + 0.0000133 * x ** 3);

  // Emit changing temperature data
  // Emit changing x coordinate
  // Emit changing y coordinate

  useInterval(() => {
    // Random Temp
    if (tempX > 800 && !subtract) setSubtract(true);
    if (tempX < 200 && subtract) setSubtract(false);
    setTempY(parabola(tempX));

    // using tempX for simplicity
    setCoordinateX(tempX);
    setCoordinateY(polynomial(tempX));

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

    if (tempX < 200) setSubtract(false);
    if (tempX > 800) setSubtract(true);

    if (subtract) setTempX(Math.abs(fixed2(tempX - Math.random() * 10)));
    else setTempX(Math.abs(fixed2(tempX + Math.random() * 10)));

    setConfig({
      ...config,
      temperature: tempY,
      x: coordinateX,
      y: coordinateY
    });

    axios({
      method: "patch",
      url: `/properties/${vehicleConfig._id}/internal`,
      data: {
        temperature: tempY,
        x: coordinateX,
        y: coordinateY
      }
    })
      .then(res => {
        console.log("************ updated");
      })
      .catch(err => {});
  }, 500);
  // have a button that can change speed

  socket.on(
    "patch property to vehicle",
    ({ newKey: key, newValue: value, id }) => {
      console.log("************ got some data", key, value, id);
      // patch data then
      if (id === vehicleConfig._id) {
        axios({
          method: "patch",
          url: `/properties/${vehicleConfig._id}`,
          data: {
            key,
            value
          }
        })
          .then(res => {
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
          })
          .catch(err => console.log("************2nd err", err));
      } else {
        console.log("dont update");
      }
    }
  );
  // i really should chagne the vehicle schema/db
  socket.on("delete property to vehicle", ({ key, id, origin }) => {
    console.log("************ prop to delete", key, origin, id);
    // delete data
    if (id === vehicleConfig._id) {
      axios({
        method: "delete",
        url: `/properties/${vehicleConfig._id}`,
        data: {
          key
        }
      })
        .then(res => {
          console.log("************ deleted", res);
          let newProps = { ...config };
          delete newProps.properties[key];
          setConfig(newProps);

          socket.emit("acknowledge delete", {
            id,
            key,
            origin,
            msg: "success"
          });
        })
        .catch(err => console.log("************2nd err", err));
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
