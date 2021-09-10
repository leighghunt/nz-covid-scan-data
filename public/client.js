/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

// var latestStats = {}
var stats = []
var todaysStats = []

function displayStats(stats){
  
  console.log('displayStats')

  console.log(stats)

  document.getElementById('qr_code_scans_today').innerText = stats.qr_code_scans_today.toLocaleString()
  document.getElementById('manual_entries_today').innerText = stats.manual_entries_today.toLocaleString()
  document.getElementById('people_with_bluetooth_tracing_active_today').innerText = stats.people_with_bluetooth_tracing_active_today.toLocaleString()

  document.getElementById('all_time_app_registrations').innerText = stats.all_time_app_registrations.toLocaleString()
  document.getElementById('all_time_posters_created').innerText = stats.all_time_posters_created.toLocaleString()

  
  updateGraph();  
}





const getLatestStatsListener = function() {
  var latestStats = JSON.parse(this.responseText)
  stats.push(latestStats)
  displayStats(latestStats);
}


socket.on('latestStats', function (latestStats) {

  stats.push(latestStats)


  console.log(stats)

  displayStats(latestStats);

});


function refreshLatestStats(){
  const latestStatsRequest = new XMLHttpRequest();
  latestStatsRequest.onload = getLatestStatsListener;
  latestStatsRequest.open('get', '/latestStats');
  latestStatsRequest.send();  
}

refreshLatestStats()



const todaysStatsListener = function() {
  todaysStats = JSON.parse(this.responseText)
  console.log(todaysStats)
  updateGraph()
}


function getTodaysStats(){
  let startOfTodayNZ = new Date()
  startOfTodayNZ.setHours(0)
  startOfTodayNZ.setMinutes(0)
  startOfTodayNZ.setSeconds(0)
  startOfTodayNZ.setMilliseconds(0)
  
  // console.log(startOfTodayNZ)

  // console.log(startOfTodayNZ.toUTCString())

  const todaysStatsRequest = new XMLHttpRequest();
  todaysStatsRequest.onload = todaysStatsListener;
  todaysStatsRequest.open('get', '/stats?from=' + startOfTodayNZ.toUTCString());
  todaysStatsRequest.send();  
}

getTodaysStats()




/*
Chart stuff
*/

var chart

function updateGraph(){

  // let labels = todaysStats.map(data => new Date(data.generated));

  let todaysQRCodeScans = todaysStats.map(data => {return {x: new Date(data.generated), y: data.qr_code_scans_today}});

  let todaysManualEntries = todaysStats.map(data => {return {x: new Date(data.generated), y: data.manual_entries_today}});

  let startOfTodayNZ = new Date()
  startOfTodayNZ.setHours(0)
  startOfTodayNZ.setMinutes(0)
  startOfTodayNZ.setSeconds(0)
  startOfTodayNZ.setMilliseconds(0)



  console.log(todaysQRCodeScans);
  
  
const data = {
  // labels: labels,
  datasets: [
    {
      label: 'QR Scans',
      // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderColor: 'rgb(255, 99, 132)',
      fill: false,
      // lineTension: 0,       
      data: todaysQRCodeScans
    },    {
      label: 'Manual entries',
      // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderColor: 'rgb(50, 99, 255)',
      fill: false,
      // lineTension: 0,       
      data: todaysManualEntries
    }
  ]
};

  const config = {
    type: 'line',
    data,
    options: {

      // elements: { point: { radius: 0 } },
      plugins: {
        title: {
          text: 'Chart.js Time Scale',
          display: true
        }
      },      
      
      scales: {
        xAxes: [{
          type: 'time',
          time: { 
            unit: 'hour',
            min: startOfTodayNZ
          },
        }],
        
       yAxes: [{

          ticks: {
           callback: function(value, index, values) {
             return value.toLocaleString("en-NZ",{});
           }
         }
       }]
        
        
//           x: {
//             type: 'time',
//             time: {
//               tooltipFormat: 'HH',
//               unit:'hour'

//             },
//             title: {
//               display: true,
//               text: 'Date'
//             }

//           }
      },
      
      animation: {
        duration:0  // prevent pesky animation, espcially on update
      }
    }
  };


  if(chart==null){
    chart = new Chart(
      document.getElementById('chart'),
      config
    )
  } else {
    chart.config.data = data;
    chart.update(/*{mode: 'none'}*/);
  } 
  
}




var lastPing = new Date()
var lastPingNo


socket.on('ping', function (pingNo) {

  // console.log('ping: ' + pingNo)
  
  if(pingNo!=null){
    
    if(pingNo > lastPingNo+1){
      console.warn("Missed ping")
      console.warn("Last pingNo:" + lastPingNo)
      console.warn("This pingNo:" + pingNo)
      console.warn("Refreshing cancellations...")
      refreshLatestStats()

    }
    lastPingNo = pingNo
    lastPing = new Date()
  } 

  // console.log(lastPing)
  
});


setInterval(function(){
  var now = new Date()
  
  var timeSinceLastPing = now - lastPing
  // console.log(timeSinceLastPing);
  
  if(timeSinceLastPing >= 300000){
    // It's been more than 5 minutes since last ping
    // Let's refresh the whole page
    location.reload()
  }

}, 60000)

