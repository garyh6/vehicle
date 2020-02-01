import { Form, Input, Row } from "antd";
import axios from "axios";
import React, { useState } from "react";
import io from "socket.io-client";
// import { useInterval } from "../../utils/useInterval";

const ConfigForm = ({ vehicleConfig }) => {
  console.log("************ vehicleConfig._id", vehicleConfig._id);
  const socket = io("http://localhost:5000", {
    query: `id=${vehicleConfig._id}`
  });
  if (!vehicleConfig.properties) vehicleConfig.properties = {};
  const fixedProps = Object.keys(vehicleConfig);
  fixedProps.splice(fixedProps.indexOf("properties"), 1);

  const [config, setConfig] = useState(vehicleConfig);

  // const currentDatetime = getCurrentDatetime();
  // const parabola = x => 6 * x ** 2 - 6 * x + 2;
  // const [subtract, setSubtract] = useState(false);
  // const [x, setX] = useState(0);
  // const [y, setY] = useState(0);

  // useInterval(() => {
  //   if (x > 5 && !subtract) setSubtract(true);
  //   if (x < 0 && subtract) setSubtract(false);
  //   setY(parabola(x));
  //   socket.emit("temperature", {
  //     temperature: y,
  //     datetime: currentDatetime
  //   });
  //   if (subtract) setX(x - Math.random());
  //   else setX(x + Math.random());

  //   setConfig({ ...config, temperature: y });
  // }, 2000);

  // socket.on("add prop", ({ err, res }) => {
  //   console.log("************ wtf", res);
  // });

  socket.on(
    "patch property to vehicle",
    ({ newKey: key, newValue: value, id }) => {
      console.log("************ got some data");
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
            setConfig({ ...config, [key]: value });
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
            <Input
              disabled
              defaultValue={config[key]}
              value={config[key]}
            ></Input>
          </Form.Item>
        ))}

        {Object.keys(config.properties)
          .sort()
          .map((key, idx) => {
            return (
              <Form.Item label={key} key={key} className="form-item-group">
                <Input
                  disabled
                  defaultValue={config.properties[key]}
                  value={config.properties[key]}
                ></Input>
              </Form.Item>
            );
          })}
      </Form>
    </Row>
  );
};

export default ConfigForm;
