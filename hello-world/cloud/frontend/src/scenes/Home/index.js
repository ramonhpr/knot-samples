import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';
import {
  Icon, Message, Card, Button, Menu, Loader
} from 'semantic-ui-react';
import KNoTCloudWebSocket from '@cesarbr/knot-cloud-websocket';
import { Context } from '../../context/store';

const Home = () => {
  const [protocol, hostname, port] = ['wss', 'ws.knot.cloud', 443];
  const { credentials, logout } = useContext(Context);
  const isLoadingRef = useRef(true);
  let isLoading = isLoadingRef.current;
  const [msgError, setMsgError] = useState('');
  const [devices, setDevices] = useState([]);
  const socket = new KNoTCloudWebSocket({
    protocol,
    hostname,
    port,
    pathname: '/',
    id: credentials.uuid,
    token: credentials.token
  });

  function toggleLoading() {
    isLoading = !isLoading;
  }

  const bla = useCallback((devices) => {
    setDevices(() => devices);
    // console.log(devices)
    toggleLoading();
    setMsgError('');
    socket.close();
  }, [devices]);

  const loadDevices = useCallback(() => {
    console.log(socket);
    socket.once('ready', () => {
      console.log('ready');
      socket.once('devices', bla);
      socket.getDevices({ type: 'knot:thing' });
    });
    socket.once('error', (err) => {
      toggleLoading();
      setMsgError(`${err.message}: Check the information provided and try again`);
      socket.close();
    });
    socket.connect();
  }, [devices]);
  
  function switchStatus(deviceId, sensorId, value) {
    socket.once('ready', () => {
      socket.once('sent', () => socket.close());
      socket.setData(deviceId, [{ sensorId, value: !value }]);
    });
    socket.once('error', (err) => {
      toggleLoading();
      setMsgError(`${err.message}: Check the information provided and try again`);
      socket.close();
    });
    socket.connect();
  }
  
  const createDeviceCard = useCallback((device) => {
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
  }, [devices]);

  console.log('aquiiiiiii');

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    console.log('mudou', isLoadingRef.current);
  }, [isLoadingRef]);
  
  return (
    <div className="App">
      <Menu inverted color="green" size="small">
        <Menu.Item as="h3" onClick={logout} position="right">Log out</Menu.Item>
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