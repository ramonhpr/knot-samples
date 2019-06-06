import React, { Component } from 'react';
// import KNoTCloudWebSocket from '@cesarbr/knot-cloud-sdk-js/clients/ws';
import KNoTCloudWebSocket from '@cesarbr/knot-cloud-websocket';
import _ from 'lodash';
import { Icon } from 'semantic-ui-react';
import { cloud } from './config';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      host: cloud.host,
      port: cloud.port
    };
    this.createDeviceCard = this.createDeviceCard.bind(this);
    this.createDeviceList = this.createDeviceList.bind(this);
    this.getDevices = this.getDevices.bind(this);
    this.switchStatus = this.switchStatus.bind(this);
  }

  getDevices() {
    const { uuid, token } = this.state;
    const { host, port } = this.state;

    if (!uuid) {
      window.alert('UUID is mandatory'); // eslint-disable-line no-alert
      return;
    }
    if (!token) {
      window.alert('TOKEN is mandatory'); // eslint-disable-line no-alert
      return;
    }

    const socket = new KNoTCloudWebSocket({
      protocol: 'wss',
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
        socket.close();
      });
      socket.getDevices({ type: 'knot:thing' });
    });
    socket.once('error', (err) => {
      window.alert(`An error occured. Check the information provided and try again. ${err}.`);
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
      window.alert(`An error occured. Check the information provided and try again. ${err}.`);
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
    const { devices, host, port } = this.state;

    return (
      <div className="App">
        <div className="header-wrapper">
          <header className="App-header">
            <h1 className="App-title">Welcome to KNoT</h1>
          </header>
        </div>
        <div className="knot-info-wrapper">
          <div className="knot-info">
            <label htmlFor="host">
              KNOT CLOUD HOST
              <input type="text" id="host" className="knot-info-text" placeholder={host} onChange={e => this.setState({ host: e.target.value })} />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="port">
              KNOT CLOUD PORT
              <input type="text" id="port" className="knot-info-text" placeholder={port} onChange={e => this.setState({ port: e.target.value })} />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="uuid">
              UUID
              <input type="text" id="uuid" className="knot-info-text" onChange={e => this.setState({ uuid: e.target.value })} />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="token">
              TOKEN
              <input type="text" id="token" className="knot-info-text" onChange={e => this.setState({ token: e.target.value })} />
            </label>
          </div>
          <button type="button" className="btn" onClick={this.getDevices}>
          GET DEVICES
          </button>
        </div>
        <div className="list-devices-wrapper">
          {_.isEmpty(devices) ? <div /> : <this.createDeviceList className="list-devices" />}
        </div>
      </div>
    );
  }
}

export default App;
