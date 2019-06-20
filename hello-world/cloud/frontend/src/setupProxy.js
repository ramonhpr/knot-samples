const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  const authHostname = process.env.AUTH_HOSTNAME || process.env.AUTH_HOST || 'localhost';
  const authPort = process.env.AUTH_PORT || 3004;
  const authenticatorTarget = `http://${authHostname}:${authPort}`;
  const dataHostname = process.env.DATA_HOSTNAME || process.env.DATA_HOST || 'localhost';
  const dataPort = process.env.DATA_PORT || 3005;
  const storageTarget = `http://${dataHostname}:${dataPort}`;

  const wsHostname = process.env.WS_HOSTNAME || 'localhost';
  const wsPort = process.env.WS_PORT || 3006;
  const wsTarget = `ws://${wsHostname}:${wsPort}`;

  app.use(proxy('/ws', {
    target: wsTarget,
    ws: true
  }));
  app.use(proxy('/api/auth', {
    target: authenticatorTarget,
    pathRewrite: { '^/api/auth': '/' }
  }));
  app.use(proxy('/api/data', {
    target: storageTarget,
    pathRewrite: { '^/api/data': '/' }
  }));
};
