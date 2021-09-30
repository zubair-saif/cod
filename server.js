const express = require('express');
const app = express();
require('express-async-errors');
const error = require('./middlewares/promisesErrorHandler');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const compression = require('compression');
const morgan = require('morgan');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mime = require('mime');

app.use(cors());
app.use(compression());
app.use('/public', express.static('public', {
  // dotfiles: 'ignore',
  etag: false,
  // extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    // console.log(path);
    res.set('Content-Type', mime.getType(path))
  }
}));
app.use(express.json());
app.use(morgan('tiny'));

//api modules
require('./app/users/routes_definations/userRoutesDef')(app);
require('./app/community/routes_definations/communityRoutesDef')(app);
require('./app/alerts/routes_definations/alertRoutesDef')(app);
require('./app/conversation/routes_definations/chatRoutesDef')(app);
require('./app/settings/routes_definations/settingsRoutesDef')(app);
require('./app/listings/routes_definations/listingsRoutesDef')(app);
require('./app/notes/routes_definations/noteRoutesDef')(app);
require('./app/forum/routes_definations/forumRoutesDef')(app);

//swagger docs implementations
require('./helper_functions/swaggerDocs.helper')(app);

// streams
require('./app/conversation/streams/chat.streams')(io);

// background jobs
require('./background_jobs/backgroundJobs')();

app.use(error);

mongoose
  .connect(config.get('dbConnection'), { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    //migrations
    require('./helper_functions/migrations')();
    console.log('connected to the db......');
  })
  .catch(err => {
    console.log('Érror .....', err.message);
  });

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
  // We quit because we don't want unhandled rejections, and later node versions will do too
  process.exit(1);
});

const port = process.env.PORT || 3003;
http.listen(port, () => {
  console.log(`We are in ${config.get('mode')} mode!`);
  console.log(`listening port ${port}`);
});
