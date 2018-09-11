const KNoTCloud = require('knot-cloud');

module.exports = client => async (req) => {
  const { meshbluHost } = req;
  const { meshbluPort } = req;
  const { meshbluAuthUUID } = req;
  const { meshbluAuthToken } = req;
  const { deviceId } = req;

  const cloud = new KNoTCloud(
    meshbluHost,
    meshbluPort,
    meshbluAuthUUID,
    meshbluAuthToken
  );

  try {
    await cloud.connect();
    await cloud.subscribe(deviceId);

    cloud.on((data) => {
      client.emit(deviceId, data);
    });
  } catch (err) {
    console.log(err); // eslint-disable-line no-console
  }
};
