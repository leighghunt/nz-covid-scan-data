// server.js
// where your node app starts

// init project
const express = require('express');
var Sequelize = require('sequelize');
const {Op} = require('sequelize');
const axios = require('axios');

const moment = require('moment');

const app = express();

// Setup SocketIO
var server = require('http').Server(app);
const io = require('socket.io')(server);
var cron = require('node-cron');

var Stats



// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  // dialectOptions: {mode: 2 | 4},    Use sequelize v5 or you'll get file/directory creation issues here
  // https://github.com/sequelize/sequelize/issues/12329#issuecomment-662160609
  logging: false,
  storage: '.data/database.sqlite'

});


// authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');

    Stats = sequelize.define('stats', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      timestamp: {
        type: Sequelize.DATE
      },


      generated: {
        type: Sequelize.DATE
      },


      qr_code_scans_today: {
        type: Sequelize.INTEGER
      },


      manual_entries_today: {
        type: Sequelize.INTEGER
      },

      people_with_bluetooth_tracing_active_today: {
        type: Sequelize.INTEGER
      },

      all_time_app_registrations: {
        type: Sequelize.INTEGER
      },


      all_time_app_registrations_daily_change: {
        type: Sequelize.STRING
      },

      all_time_posters_created: {
        type: Sequelize.INTEGER
      },


      all_time_posters_created_daily_change: {
        type: Sequelize.STRING
      },

      JSON: {
        type: Sequelize.STRING
      }

    });
    
    setup();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default users
function setup(){
  console.log('setup')
  Stats.sync(
    {force: true},
    { alter: true }
  ) 
    .then(function(){

    // Cancellation.create({routeId: -1, route_short_name: "BLAH", description: "BLAH BLAH BLAH", startDate: new Date(), endDate: new Date(), cause: "TEST", effect: "NONE"})
    });  
}

app.use(express.static('public'));


let statsURL = "https://enf.tracing.covid19.govt.nz/api/pages/stats"

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

server.listen(process.env.PORT);

// var distanceBetweenLocations = require('./distanceBetweenLocations');


updateStats()
function updateStats(){

  console.log("updateStats")

  axios.get(statsURL, {
    headers: {
      // 'x-api-key': process.env.metlink_api_key
    }})
  .then(async function (apiResponse) {
    
    console.log("updateStats - response")

    console.log("apiResponse.data length:" + JSON.stringify(apiResponse.data).length)
    
    console.log(JSON.stringify(apiResponse.data))
    console.log(apiResponse.data['dashboardItems'])

    // console.log(apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='QR code scans today'))

    console.log(apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='QR code scans today').value)
    console.log(apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='Manual entries today').value)
    console.log(apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='People with Bluetooth tracing active today').value)


    console.log(apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time app registrations').value)

    console.log(apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time app registrations').dailyChange)

    console.log(apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time posters created').value)

    console.log(apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time posters created').dailyChange)





    var latestStat = {
      timestamp: new Date(),
      generated: apiResponse.data.generated,

      qr_code_scans_today: apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='QR code scans today').value,
      manual_entries_today: apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='Manual entries today').value,
      people_with_bluetooth_tracing_active_today: apiResponse.data['dashboardItems'][0].find(d => d.subtitle=='People with Bluetooth tracing active today').value,
      
      all_time_app_registrations: apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time app registrations').value,
      all_time_app_registrations_daily_change: apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time app registrations').dailyChange,

      all_time_posters_created: apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time posters created').value,
      all_time_posters_created_daily_change: apiResponse.data['dashboardItems'][1].find(d => d.subtitle=='All time posters created').dailyChange,
      JSON: JSON.stringify(apiResponse.data)
    }    
    
//     apiResponse.data.entity.forEach(async (entity) => {
      
    console.log(latestStat);

    latestStat = await Stats.create(latestStat)

    console.log('emitting...')

    console.log(latestStat)

    io.emit('latestStats', latestStat)

    // })
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })  
}

app.get('/latestStats/', async function(request, response) {

    Stats.findOne({order: [['timestamp', 'DESC']]})
      .then(stats => {
        response.setHeader('Content-Type', 'application/json')
        response.send(JSON.stringify(stats));
    });
});


app.get('/last24HoursStats/', async function(request, response) {

    var startOfTodayNz = new Date()
    Stats.findAll(
      {
        order: [['timestamp', 'DESC']],
        where: {
        generated: null
        }


      })
      .then(stats => {
        response.setHeader('Content-Type', 'application/json')
        response.send(JSON.stringify(stats));
    });
});





cron.schedule('*/1 * * * *', () => {
  updateStats();
});





io.on("connection", (socket) => {
  console.log("io.on connection")
  
  // console.log(io.socket.clients().length)
  // console.log("Emiting ping to " + socket.listenersAny().count() + " listeners")

});

var pingNo = 0
// Ping every minute - and in client check if last ping was more than 5 minutes ago
setInterval(function(){
  console.log("ping")

  console.log(pingNo)

  console.log(new Date())

  io.emit("ping", ++pingNo)
}, 60000)
