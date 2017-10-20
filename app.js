const Hapi = require('hapi'),
  inert = require('inert');
const server = new Hapi.Server();

const users = {};

server.connection({
  port: process.env.PORT || 8080,
  host: '0.0.0.0'
});
const io = require('socket.io')(server.listener);

io.on('connection', socket => {
  console.log('connection');
  users[socket.id] = {

  };
  socket.on('update', (targetId, data) => {
    if(!users[targetId]){
      return;
    }
    socket.to(targetId).emit('update', data);
  });
  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

server.register(inert, err => {
  if (err) {
    throw err;
  }
  server.route({
    method: 'GET',
    path: `/{param*}`,
    handler: {
      directory: {
        path: `./public`,
        redirectToSlash: true,
        index: true
      }
    }
  })
});

server.start(err => {
  if (err){
    throw err;
  }
});
