import React , { createContext, useReducer } from 'react';
import Authenticator from '@cesarbr/knot-cloud-sdk-js-authenticator';
import Storage from '@cesarbr/knot-cloud-sdk-js-storage';
import KNoTCloudWebSocket from '@cesarbr/knot-cloud-websocket';

const Context = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'login':
      const { uuid, token } = action;
      localStorage.setItem('uuid', uuid);
      localStorage.setItem('token', token);
      return { uuid, token };
    case 'logout':
      localStorage.removeItem('uuid');
      localStorage.removeItem('token');
      return { uuid: null, token: null };
    default:
      throw new Error('');
  }
}

const ContextProvider = ({ children }) => {
  const { hostname } = window.location;
  const port = window.location.protocol === 'https:' ? 443 : 80;
  const [credentials, dispatcher] = useReducer(reducer, {
    uuid: localStorage.getItem('uuid'),
    token: localStorage.getItem('token'),
  });
  const value = {
    credentials,
    login: (uuid, token) => dispatcher({ type: 'login', uuid, token }),
    logout: () => dispatcher({ type: 'logout' }),
    authenticator: new Authenticator({
      protocol: port === 443 ? 'https' : 'http',
      hostname,
      port,
      pathname: '/api/auth'
    }),
    storage: new Storage({
      protocol: port === 443 ? 'https' : 'http',
      hostname,
      port,
      pathname: '/api/data',
      id: credentials.uuid || 'invalid',
      token: credentials.token || 'invalid'
    }),
    cloud: new KNoTCloudWebSocket({
      protocol: port === 443 ? 'wss' : 'ws',
      hostname,
      port,
      pathname: '/ws',
      id: credentials.uuid,
      token: credentials.token
    }),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>
};

const ContextConsumer = Context.Consumer;

export { Context, ContextProvider, ContextConsumer };
