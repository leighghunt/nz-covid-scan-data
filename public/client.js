/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

// var latestStats = {}
var stats = []

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



/*
Chart stuff
*/

var chart

function updateGraph(){

//   let labels = []
//   let dataValues = []
  
  var now = new Date()
  
//   let hoursOffset = now.getHours() 

//   var hour = hoursOffset
  
//   var reviewPeriodHours = reviewPeriodDays * 24
  
//   var bins = reviewPeriodHours
//   var binDateDiffMiliseconds = 60 * 60 * 1000

//   var displayingDays = false;
//   if(reviewPeriodDays>3){
//     displayingDays = true;
//   }

//   if(displayingDays == true){
//     bins = reviewPeriodDays
//     binDateDiffMiliseconds = 24 * 60 * 60 * 1000
//   }
  
//   console.log(bins)
//   var mostRecentBinDate = new Date()
//   console.log('mostRecentBinDate')
//   console.log(mostRecentBinDate)
//   // binDate.setHours(-5)

//   mostRecentBinDate.setMinutes(0)
//   mostRecentBinDate.setSeconds(0)
//   mostRecentBinDate.setMilliseconds(0)

//   console.log(mostRecentBinDate)
//   if(displayingDays){
//     mostRecentBinDate.setHours(0)
//   }

//   var binDate = new Date(mostRecentBinDate.getTime() - bins * binDateDiffMiliseconds)


//   // Set up bins
//   // var lastBinHours = 0;
//   for(var binIndex = 0; binIndex < bins; ++binIndex){
//     binDate = new Date(binDate.getTime() + binDateDiffMiliseconds)
//     // console.log('binIndex: ' + binIndex)
//     // console.log(binDate)

    
//       if(displayingDays){
//         labels[binIndex] = binDate.getDate()
//       } else {
//         // if(binDate.getHours() == 0){
//         //   labels[binIndex] = "> " + binDate.getHours()
//         // } else {
//           labels[binIndex] = binDate.getHours() + ":00"
//         // }
//       }
//     dataValues[binIndex] = 0
//   }

//   // Populate data in each bin
//   cancellations.forEach(cancellation => {

//     var targetBinDate = new Date(cancellation.timestamp)
//     targetBinDate.setMinutes(0)
//     targetBinDate.setSeconds(0)
//     targetBinDate.setMilliseconds(0)
//     // console.log(targetBinDate)

//     if(displayingDays){
//       targetBinDate.setHours(0)
//     }
//     // console.log(targetBinDate)

//     var targetBinIndex = bins -1 - (mostRecentBinDate.getTime() - targetBinDate.getTime())/ binDateDiffMiliseconds
    
//     // console.log((mostRecentBinDate.getTime() - targetBinDate.getTime())/ binDateDiffMiliseconds)
//     console.log(cancellation.timestamp)
//     console.log(targetBinIndex)
//     dataValues[targetBinIndex]++

  
  const data = {
    labels: ['A', 'b', 'c'],
    datasets: [{
      label: 'Scans Today',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [1, 2, 3],
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

