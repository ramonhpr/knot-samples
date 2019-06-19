import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Login from './scenes/Login';
import Home from './scenes/Home';
import { ContextProvider } from './context/store';

const App = () => {
  return <ContextProvider>
    <BrowserRouter>
      <Route path='/login' component={Login} />
      <Route exact path='/' component={Home} />
    </BrowserRouter>
  </ContextProvider>;
}

export default App;
