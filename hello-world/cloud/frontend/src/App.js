import React, { Component } from 'react';
// import KNoTCloudWebSocket from '@cesarbr/knot-cloud-sdk-js/clients/ws';
import KNoTCloudWebSocket from '@cesarbr/knot-cloud-websocket';
import _ from 'lodash';
import { Icon, Form, Message, Input, Dropdown } from 'semantic-ui-react';
import { cloud } from './config';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      protocol: cloud.protocol,
      host: cloud.host,
      port: cloud.port,
      isLoading: false
    };
    this.createDeviceCard = this.createDeviceCard.bind(this);
    this.createDeviceList = this.createDeviceList.bind(this);
    this.getDevices = this.getDevices.bind(this);
    this.switchStatus = this.switchStatus.bind(this);
  }

  getDevices() {
    const { uuid, token } = this.state;
    const { protocol, host, port } = this.state;
    this.setState({ isLoading: true });

    if (!uuid) {
      this.setState({ msgError: 'UUID is mandatory', isLoading: false });
      return;
    }
    if (!token) {
      this.setState({ msgError: 'TOKEN is mandatory', isLoading: false });
      return;
    }

    console.log(protocol);
    const socket = new KNoTCloudWebSocket({
      protocol,
      hostname: host,
      port,
      pathname: '/',
      id: uuid,
      token
    });

    this.setState({
      socket
    });

    socket.once('ready', () => {
      socket.once('devices', (devices) => {
        this.setState({ devices });
        this.setState({ isLoading: false, msgError: null });
        socket.close();
      });
      socket.getDevices({ type: 'knot:thing' });
    });
    socket.once('error', (err) => {
      this.setState({ isLoading: false, msgError: `${err.message}: Check the information provided and try again` });
      socket.close();
    });
    socket.connect();
  }

  switchStatus(deviceId, sensorId, value) {
    const { socket } = this.state;

    socket.once('ready', () => {
      socket.once('sent', () => socket.close());
      socket.setData(deviceId, [{ sensorId, value: !value }]);
    });
    socket.once('error', (err) => {
      this.setState({ isLoading: false, msgError: `${err.message}: Check the information provided and try again` });
      socket.close();
    });
    socket.connect();
  }

  createDeviceCard(device) {
    const { id } = device.knot;
    const { name } = device.metadata;
    const { sensorId } = device.schema[0];

    return (
      <div className="online-device" id={id} key={id}>
        <div className="device-info">
          <div className="device-name">
            {name}
          </div>
          <div className="device-id">
            {id}
          </div>
        </div>
        {/* TODO: change to consume storage API */}
        <div className="device-value">
          {device.value ? <Icon name="lightbulb outline" color="yellow" size="massive" /> : <Icon name="lightbulb" color="black" size="massive" />}
        </div>
        <button type="button" className="switch" onClick={() => this.switchStatus(id, sensorId, device.value)}>
              CHANGE VALUE
        </button>
      </div>
    );
  }

  createDeviceList() {
    const { devices } = this.state;

    return (
      <div id="online-devices">
        <h1 className="online-devices-header">
          ONLINE DEVICES
        </h1>
        {_.map(devices, this.createDeviceCard)}
      </div>
    );
  }

  render() {
    const {
      devices, protocol, host, port, isLoading, msgError
    } = this.state;
    const protocolOptions = [
      { key: 'ws', text: 'ws://', value: 'ws' },
      { key: 'wss', text: 'wss://', value: 'wss' }
    ];
    // TODO: make options to protocol ws and wss with Dropdown
    // https://react.semantic-ui.com/elements/input/#variations-right-labeled

    return (
      <div className="App">
        <div className="header-wrapper">
          <header className="App-header">
            <h1 className="App-title">Welcome to KNoT</h1>
          </header>
        </div>
        <div className="knot-info-wrapper">
          <Form loading={isLoading} error={msgError}>
            <Form.Field>
              <label>KNOT CLOUD HOST</label>
              <Form.Input
                fluid
                as={Input}
                label={<Dropdown
                  defaultValue={protocol}
                  onChange={(e, data) => this.setState({ protocol: data.value })}
                  options={protocolOptions} />}
                type="text"
                id="host"
                placeholder={host}
                onChange={e => this.setState({ host: e.target.value })}
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                fluid
                label="KNOT CLOUD PORT"
                type="number"
                id="port"
                placeholder={port}
                onChange={e => this.setState({ port: e.target.value })}
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                fluid
                label="UUID"
                type="text"
                id="uuid"
                className="knot-info-text"
                onChange={e => this.setState({ uuid: e.target.value })}
                required
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                fluid
                label="TOKEN"
                type="text"
                id="token"
                className="knot-info-text"
                onChange={e => this.setState({ token: e.target.value })}
                required
              />
            </Form.Field>
            <Message error header={msgError} hidden={_.isEmpty(msgError)} />
            <Form.Button type="submit" color="green" onClick={this.getDevices}>
              GET DEVICES
            </Form.Button>
          </Form>
        </div>
        <div className="list-devices-wrapper">
          {_.isEmpty(devices) ? <div /> : <this.createDeviceList className="list-devices" />}
        </div>
      </div>
    );
  }
}

export default App;
