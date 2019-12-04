const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(logger);

// middleware
function logger(req, res, next) {
  console.log(`${req.method} to ${req.originalUrl}`);

  next(); // allows the request to continue to the next middleware or route handler
}

// write a gatekeeper middleware that reads a password from the headers and if the password is 'mellon', let it continue
// if not, send back status code 401 and a message
function gateKeeper(req, res, next) {
  const pw = req.headers.password;

  if (pw === 'mellon') {
    next();
  } else {
    res.status(401).json({error: 'Password not recognized'});
  }
}

// check is role for 'admin' and 'agent'
function checkRole(role) {
  
  return function(req, res, next) {
    if(role && role === req.headers.role) {
      next();
    } else {
      res.status(403).json({error: 'You can\'t access this'});
    }
  }
}

// endpoints
server.use('/api/hubs', checkRole('admin'), hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.get('/echo', (req, res) => {
  res.send(req.headers);
});

server.get('/area51', helmet(), gateKeeper, checkRole('agent'), (req, res) => {
  res.send(req.headers);
})

module.exports = server;
