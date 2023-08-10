const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTIONS! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejections', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTIONS! shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

const main = async () => {
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

  await mongoose.connect(DB);

  console.log('DB connection successful');
};

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

main();
