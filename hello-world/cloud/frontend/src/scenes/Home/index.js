import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';
import {
  Icon, Message, Card, Button, Menu, Loader
} from 'semantic-ui-react';
import { Context } from '../../context/store';

const Home = () => {
  const { credentials, socket, logout } = useContext(Context);
  const [isLoading, setIsLoading] = useState(() => true);
  const [msgError, setMsgError] = useState(() => '');
  const [devices, setDevices] = useState(() => []);

  const onError = (err) => {
    setIsLoading(() => true);
    setDevices(() => []);
    setMsgError(`${err}. Check the information provided and try again`);
    socket.close();
    setTimeout(loadDevices, 3000);
  }

  const loadDevices = () => {
    socket.once('ready', () => {
      console.log('ready')
      socket.once('devices', (devices) => {
        console.log('devices')
        setDevices(() => devices);
        setIsLoading(() => false);
        setMsgError(() => '');
        socket.close();
      });
      socket.getDevices({ type: 'knot:thing' });
    });
    socket.connect();
  };

  const switchStatus = (deviceId, sensorId, value) => {
    socket.once('ready', () => {
      socket.once('sent', () => socket.close());
      socket.setData(deviceId, [{ sensorId, value: !value }]);
    });

    socket.connect();
  }

  const createDeviceCard = (device) => {
    const { id } = device.knot;
    const { name } = device.metadata;
    let sensorId;
    if (device.schema) {
      ([{ sensorId }] = device.schema);
    } else { // Ignore devices without schema
      return null;
    }

    return (
      <Card className="online-device" id={id} key={id}>
        <Card.Content className="device-info">
          <Card.Header className="device-name">
            {device.value ? <Icon name="lightbulb outline" color="yellow" size="big" /> : <Icon name="lightbulb" color="black" size="big" />}
            {name}
            {/* TODO: change to consume storage API */}
          </Card.Header>
          <Card.Meta className="device-id">
            {id}
          </Card.Meta>
        </Card.Content>

        <Card.Content extra>
          <Button type="button" color="green" onClick={() => switchStatus(id, sensorId, device.value)}>
            CHANGE VALUE
          </Button>
        </Card.Content>
      </Card>
    );
  };

  useEffect(() => { // componentDidMount
    if (credentials.uuid || credentials.token) {
      loadDevices();
      socket.on('error', onError);
    }

    return function cleanup() {
      // socket.close();
    }
  }, [socket]);

  return (
    <div className="App">
      <Menu inverted color="green" size="large">
        <Menu.Item header>KNoT Hello world</Menu.Item>
        <Menu.Item onClick={logout} position="right">Log out</Menu.Item>
      </Menu>
      {!credentials.uuid && !credentials.token && <Redirect to="/login" />}
      <div>
        <div id="devices">
          <h1 className="devices-header">
            DEVICES
          </h1>
          <Card.Group className="device-grid">
            {_.map(devices, createDeviceCard)}
          </Card.Group>
          <Loader active={isLoading} />
          <Message error header={msgError} hidden={_.isEmpty(msgError)} />
        </div>
      </div>
    </div>
  );
}

export default Home;