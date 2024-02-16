export const getPort = () => {
  let port = process.env.PORT || 3700;
  if (typeof port === 'string') port = parseInt(port);
  return port;
};
