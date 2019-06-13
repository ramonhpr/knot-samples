import React , { createContext, useReducer } from 'react';
import Authenticator from '../services/Authenticator';
import { cloud } from '../config';

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
  }
}

const ContextProvider = ({ children }) => {
  const [credentials, dispatcher] = useReducer(reducer, { 
    uuid: localStorage.getItem('uuid'), 
    token: localStorage.getItem('token'),
  });
  const value = { 
    credentials,
    login: (uuid, token) => dispatcher({ type: 'login', uuid, token }),
    logout: () => dispatcher({ type: 'logout' }),
    Authenticator: new Authenticator({ protocol: 'https', hostname: `auth.${cloud.host}`, port: cloud.port })
  };
  return <Context.Provider value={value}>{children}</Context.Provider>
};

const ContextConsumer = Context.Consumer;

export { Context, ContextProvider, ContextConsumer };
