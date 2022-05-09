const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const clc = require('cli-color');

const sequelize = require('./config/connection');
// stores session in a database. Used to instantiate store: new SequelizeStore  in const sess(below)
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create({ helpers });

// sessions activity 15
const sess = {
  secret: 'Super secret secret',
  cookie: { maxAge: 100000 },
  // forces the session to be saved back to the session store -> most cases this will be false
  resave: false,
  // force a session that is new but not yet modified to be saved back to the session store -> most cases this will be true
  saveUninitialized: true,
  // creates session table in database and allows to keep track of users logged in/ passes in sequalized infomation in Express
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// informs Express.js the use of const sess
app.use(session(sess));

// Inform Express.js on which template engine to use
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(clc.green('Now listening')));
});
