export default () => ({
  blockcypher: {
    baseUrl:
      process.env.BLOCKCYPHER_BASE_URL ||
      'https://api.blockcypher.com/v1/btc/main',
    apiKey: process.env.BLOCKCYPHER_API_KEY || 'your-api-key',
    socketUrl:
      process.env.BLOCKCYPHER_SOCKET_URL ||
      'wss://socket.blockcypher.com/v1/btc/main',
  },
  db: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017',
    host: process.env.DATABASE_HOST || 'localhost',
    name: process.env.DATABASE_NAME || 'backend_crypto_app',
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
  },
  test_db: {
    uri: process.env.TEST_DATABASE_URI || 'mongodb://localhost:27018',
    host: process.env.TEST_DATABASE_HOST || 'localhost',
    name: process.env.TEST_DATABASE_NAME || 'backend_crypto_app_test',
    username: process.env.TEST_DATABASE_USERNAME || '',
    password: process.env.TEST_DATABASE_PASSWORD || '',
  },
});
