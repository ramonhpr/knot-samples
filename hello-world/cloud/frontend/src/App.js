import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import { Icon } from 'semantic-ui-react';
import axios from 'axios'
import { meshbluDefault } from './config';

const meshbluDefaultHost = meshbluDefault.host;
const meshbluDefaultPort = meshbluDefault.port;

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.createDeviceCard = this.createDeviceCard.bind(this);
    this.createDeviceList = this.createDeviceList.bind(this);
    this.getDevices = this.getDevices.bind(this);
    this.switchStatus = this.switchStatus.bind(this);
  }

  getDevices() {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;

    if (!uuid) {
      window.alert('UUID is mandatory'); // eslint-disable-line no-alert
      return;
    }
    if (!token) {
      window.alert('TOKEN is mandatory'); // eslint-disable-line no-alert
      return;
    }

    axios.get('devices', {
      headers: {
        'Meshblu-Host': host || meshbluDefaultHost,
        'Meshblu-Port': port || meshbluDefaultPort,
        'Meshblu-Auth-UUID': uuid,
        'Meshblu-Auth-Token': token
      }
    })
      .then((response) => {
        this.setState({
          devices: response.data
        });
      })
      .catch((error) => { // eslint-disable-next-line no-alert
        window.alert(`An error occured. Check the information provided and try again. ${error}.`);
      });
  }

  switchStatus(deviceId, sensorId, value) {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;

    axios.put(`/devices/${deviceId}/sensors/${sensorId}`, {
      data: {
        value: value ? 'false' : 'true'
      }
    }, {
      headers: {
        'Meshblu-Host': host || meshbluDefaultHost,
        'Meshblu-Port': port || meshbluDefaultPort,
        'Meshblu-Auth-UUID': uuid,
        'Meshblu-Auth-Token': token
      }
    })
      .then(() => { // eslint-disable-next-line no-alert
        window.alert('Status updated!');
      })
      .catch((error) => { // eslint-disable-next-line no-alert
        window.alert(`An error occured. Check the information provided and try again. ${error}.`);
      });
  }

  createDeviceCard(device) {
    return (
      <div className="online-device" id={device.id} key={device.id}>
        <div className="device-info">
          <div className="device-name">
            {device.name}
          </div>
          <div className="device-id">
            {device.id}
          </div>
        </div>
        <div className="device-value">
          {device.value ? <Icon name="lightbulb outline" color="yellow" size="massive" /> : <Icon name="lightbulb" color="black" size="massive" />}
        </div>
        <button type="button" className="switch" onClick={() => this.switchStatus(device.id, device.sensorid, device.value)}>
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
    const { devices } = this.state;

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
              MESHBLU HOST
              <input type="text" id="host" className="knot-info-text" placeholder={meshbluDefaultHost} onChange={e => this.setState({ host: e.target.value })} />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="port">
              MESHBLU PORT
              <input type="text" id="port" className="knot-info-text" placeholder={meshbluDefaultPort} onChange={e => this.setState({ port: e.target.value })} />
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
