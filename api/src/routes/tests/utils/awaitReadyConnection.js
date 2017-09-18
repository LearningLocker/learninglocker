export default connection =>
  new Promise((resolve) => {
    if (connection.readyState !== 1) {
      connection.on('connected', () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
