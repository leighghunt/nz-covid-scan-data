/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

var latestStats = {}
// var stats = []
var todaysStats = []
var historicStats = []

function displayStats(stats){
  
  //console.log('displayStats')

  //console.log(stats)

  document.getElementById('qr_code_scans_today').innerText = latestStats.qr_code_scans_today.toLocaleString()
  document.getElementById('manual_entries_today').innerText = latestStats.manual_entries_today.toLocaleString()
  document.getElementById('people_with_bluetooth_tracing_active_today').innerText = latestStats.people_with_bluetooth_tracing_active_today.toLocaleString()

  document.getElementById('all_time_app_registrations').innerText = latestStats.all_time_app_registrations.toLocaleString()
  document.getElementById('all_time_posters_created').innerText = latestStats.all_time_posters_created.toLocaleString()

  
  updateGraph();  
}





const getLatestStatsListener = function() {
  latestStats = JSON.parse(this.responseText)
  todaysStats.push(latestStats)
  displayStats(latestStats);
}


socket.on('latestStats', function (stats) {
  latestStats = stats
  todaysStats.push(latestStats)


  //console.log(stats)

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




const historicStatsListener = function() {
  historicStats = JSON.parse(this.responseText)
  //console.log(historicStats)
  updateHistoricGraph()
}


function getHistoricStats(){
  // let startOfTodayNZ = new Date()
  // startOfTodayNZ.setHours(0)
  // startOfTodayNZ.setMinutes(0)
  // startOfTodayNZ.setSeconds(0)
  // startOfTodayNZ.setMilliseconds(0)
  
  // console.log(startOfTodayNZ)

  // console.log(startOfTodayNZ.toUTCString())

  const historicStatsRequest = new XMLHttpRequest();
  historicStatsRequest.onload = historicStatsListener;
  historicStatsRequest.open('get', '/historicData.json')
  historicStatsRequest.send();  
}

setTimeout(function(){ getHistoricStats() }, 1000);


/*
Chart stuff
*/

var chart
var chartPerQuarterHour
var chartHistoric



function groupByDuration(objectArray, duration = 15) {
  return objectArray.reduce(function (acc, obj) {
    
  
    var dateRoundedUpToNextPeriod = new Date(obj.generated)
    const nextPeriod = (Math.ceil(dateRoundedUpToNextPeriod.getMinutes()/duration))*duration
    dateRoundedUpToNextPeriod.setMinutes(nextPeriod)
    dateRoundedUpToNextPeriod.setSeconds(0)
    dateRoundedUpToNextPeriod.setMilliseconds(0)
    // console.log(nearestQuarterHour)
    // console.log(dateRoundedUpToNext15Mins)

    let key = dateRoundedUpToNextPeriod.getMinutes()/duration + dateRoundedUpToNextPeriod.getHours() * (60/duration)
    key = key - 1 // zero based
    
    if (!acc[key]) {
//      acc=[]  // make sure we're an array and not an object
      acc[key] = obj
    }
    
    //acc[key].push(obj)
    obj.qr_code_scans_today = Math.max(acc[key].qr_code_scans_today, obj.qr_code_scans_today)
    acc[key] = obj
    return acc
  }, []) // make sure we're an array and not an object
}


function updateGraph(){

  // console.log('updateGraph: todaysStats')
  // console.log(todaysStats)

  let labels = todaysStats.map(data => new Date(data.generated));

  let todaysQRCodeScans = todaysStats.map(data => {return {x: new Date(data.generated), y: data.qr_code_scans_today}});

  let todaysManualEntries = todaysStats.map(data => {return {x: new Date(data.generated), y: data.manual_entries_today}});
  
  let barChartPeriod = 15 // mins
  let todaysQRScansGroupByPeriod = groupByDuration(todaysStats, barChartPeriod)

  //console.log(todaysQRScansGroupBy15Mins)

  //console.log("Increases.....")

  let prevTotal = 0
  let increasesByPeriod = todaysQRScansGroupByPeriod.map(function (element, index, array) {


      let data = {
        x: new Date(element.generated),
        y: element.qr_code_scans_today - prevTotal      
      }

      //let data = element.qr_code_scans_today - prevTotal      
    
      prevTotal = element.qr_code_scans_today

      return data
    } 
  )

  //Array(4 * 24).fill('')
  let labelsByPeriod = Array((60/barChartPeriod) * 24).fill(0)
  labelsByPeriod = labelsByPeriod.map(function (element, index, array) {
    if(index % (60/barChartPeriod) == 0)
    {
      //return '+'
      return index / (60/barChartPeriod)
    }
    return ''
  }
  )
  
  // console.log('labelsByPeriod')
  // console.log(labelsByPeriod)


  let startOfTodayNZ = new Date()
  startOfTodayNZ.setHours(0)
  startOfTodayNZ.setMinutes(0)
  startOfTodayNZ.setSeconds(0)
  startOfTodayNZ.setMilliseconds(0)

  let endOfTodayNZ = new Date(startOfTodayNZ)
  endOfTodayNZ.setDate(endOfTodayNZ.getDate() + 1);

  //console.log('todaysStats');
  //console.log(todaysStats)


  // console.log('todaysQRCodeScans');
  // console.log(todaysQRCodeScans);

  
//   console.log('todaysQRScansGroupByPeriod')
//   console.log(todaysQRScansGroupByPeriod)

  //labels = todaysQRScansGroupBy15Mins.map(data => new Date(data.generated));

  // console.log('increasesByPeriod')
  // console.log(increasesByPeriod)
  
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'QR Scans',
          // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
          borderColor: 'rgb(255, 99, 132)',
          fill: false,
          // lineTension: 0,       
          data: todaysQRCodeScans,
          yAxisId: 'y1'
        }, {
        type: 'line',
        label: 'Manual entries',
        borderColor: 'rgb(50, 99, 255)',

        backgroundColor: 'rgb(50, 99, 255)',

        fill: false,
        // lineTension: 0,       
        data: todaysManualEntries,
        yAxisId: 'y2'
      }
    ]
  };

  const config = {
    type: 'line',
    data: data,
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
            min: startOfTodayNZ,
            max: endOfTodayNZ
          },
        }],
        
       yAxes: [
         {
          ticks: {
           callback: function(value, index, values) {
             return value.toLocaleString("en-NZ",{});
           }
         }
      }]
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
  
  
  
  const dataPerQuarterHour = {
    labels: labelsByPeriod,
    //labels: Array(4 * 24).fill(''),
    datasets: [
      {
        label: 'Scans/quarter hour',
        backgroundColor: 'rgb(5255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        lineTension: 0,       
        data: increasesByPeriod,
      }

    ]
  };
  
  
  const configPerQuarterHour = {
    type: 'bar',
    data: dataPerQuarterHour,
    options: {

      elements: { point: { radius: 0 } },
      plugins: {
        title: {
          text: 'Chart.js Time Scale',
          display: true
        }
      },      
      
      scales: {
        xAxes: [{
          //type: 'time',
          time: { 
            unit: 'hour',
            min: startOfTodayNZ,
            max: endOfTodayNZ
          },
        }],
        
       yAxes: [
         {
          ticks: {
           callback: function(value, index, values) {
             return value.toLocaleString("en-NZ",{});
           }
         }
      }]
      },      
      animation: {
        duration:0  // prevent pesky animation, espcially on update
      }
    }
  };


  if(chartPerQuarterHour==null){
    chartPerQuarterHour = new Chart(
      document.getElementById('chartPerQuarterHour'),
      configPerQuarterHour
    )
  } else {
    chartPerQuarterHour.config.data = dataPerQuarterHour;
    chartPerQuarterHour.update(/*{mode: 'none'}*/);
  } 
  
  
  //chartPer15Mins
}

function updateHistoricGraph(){
  let historicQRCodeScans = historicStats.map(data => {
    return {
      // x: new Date(data['Date/Time To']), 
      x: new Date(
        data['Date/Time To'].toString().substr(6, 4) + '-' + 
        data['Date/Time To'].toString().substr(3, 2) + '-' + 
        data['Date/Time To'].toString().substr(0, 2) 
      ), 
      y: parseInt(data.Scans.replace(/,/g, ''))
    }
  });
  
  // historicQRCodeScans.push({x: new Date(), y: latestStats.qr_code_scans_today})
  
  const data = {
    // labels: labels,
    datasets: [
      {
        label: 'QR Scans',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScans
      }
    ]
  };

  const config = {
    type: 'line',
    data,
    options: {
      // elements: { point: { radius: 0 } },
      
      scales: {
        xAxes: [{
          type: 'time',
          time: { 
            unit: 'month'
          },
        }],
        
       yAxes: [{

          ticks: {
           callback: function(value, index, values) {
             return value.toLocaleString("en-NZ",{});
           }
         }
       }]
      },      
      animation: {
        duration:0  // prevent pesky animation, espcially on update
      }
    }
  };


  if(chartHistoric==null){
    chartHistoric = new Chart(
      document.getElementById('chartHistoric'),
      config
    )
  } else {
    chartHistoric.config.data = data;
    chartHistoric.update(/*{mode: 'none'}*/);
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


