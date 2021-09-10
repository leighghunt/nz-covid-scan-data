/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

// var latestStats = {}
var stats = []
var todaysStats = []

function displayStats(stats){
  
  console.log('displayStats')

  console.log(stats)

  document.getElementById('qr_code_scans_today').innerText = stats.qr_code_scans_today

  document.getElementById('manual_entries_today').innerText = stats.manual_entries_today

  document.getElementById('people_with_bluetooth_tracing_active_today').innerText = stats.people_with_bluetooth_tracing_active_today


  document.getElementById('all_time_app_registrations').innerText = stats.all_time_app_registrations

  document.getElementById('all_time_posters_created').innerText = stats.all_time_posters_created

  /*
  
12:20 PM
  manual_entries_today: '36,542',
12:20 PM
  people_with_bluetooth_tracing_active_today: '2,079,018',
12:20 PM
  all_time_app_registrations: '3,193,338',
12:20 PM
  all_time_app_registrations_daily_change: '1,323 new today',
12:20 PM
  all_time_posters_created: '707,199',
12:20 PM
  all_time_posters_created_daily_change: '0 new today',
  */
  
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

  let todaysData = todaysStats.map(data => {return {x: data.generated, y: data.qr_code_scans_today}});
  console.log(todaysData);
  
  const data = {
    // labels: ['A', 'b', 'c'],
    datasets: [{
      label: 'Scans Today',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: todaysData,
    }]
  };

  const config = {
    type: 'line',
    data,
    options: {
      
      
        // scales: {
        //     x: {
        //         type: 'timeseries',
        //     }
        // },
      
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

