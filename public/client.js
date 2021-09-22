/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

var latestStats = null
// var stats = []
var todaysStats = []
var thisDayLastWeeksStats = []

var previousDaysStats = []

var historicStats = []

const previousDaysScansToShow = 7
  

function displayStats(stats){
  
  //console.log('displayStats')

  //console.log(stats)

  if(latestStats){
    document.getElementById('qr_code_scans_today').innerText = latestStats.qr_code_scans_today.toLocaleString()
    document.getElementById('manual_entries_today').innerText = latestStats.manual_entries_today.toLocaleString()
    document.getElementById('people_with_bluetooth_tracing_active_today').innerText = latestStats.people_with_bluetooth_tracing_active_today.toLocaleString()

    document.getElementById('all_time_app_registrations').innerText = latestStats.all_time_app_registrations.toLocaleString()
    document.getElementById('all_time_posters_created').innerText = latestStats.all_time_posters_created.toLocaleString()

    let percentageOfLastWeek = 0
    
    // Average approach 1
    {
      let thisTimeLastWeek = new Date()
      thisTimeLastWeek.setDate(thisTimeLastWeek.getDate()-7)
      // console.log(thisTimeLastWeek)

      let thisTimeLastWeekMinus5Mins = new Date(thisTimeLastWeek)
      thisTimeLastWeekMinus5Mins.setMinutes(thisTimeLastWeekMinus5Mins.getMinutes()-15)

      let timeNow = new Date()
      let timeNowMinus5Mins = new Date()
      timeNowMinus5Mins.setMinutes(timeNowMinus5Mins.getMinutes()-15)

  //     console.log('thisTimeLastWeek')
  //     console.log(thisTimeLastWeek)
  //     console.log('thisTimeLastWeekMinus5Mins')
  //     console.log(thisTimeLastWeekMinus5Mins)
  //     console.log('timeNow')
  //     console.log(timeNow)
  //     console.log('timeNowMinus5Mins')
  //     console.log(timeNowMinus5Mins)



      if(thisDayLastWeeksStats && thisDayLastWeeksStats.length>0){
        const qr_code_scans_compared_to_this_time_last_week = thisDayLastWeeksStats.filter(s => {
          const generated = new Date(s.generated)
          if( generated >= thisTimeLastWeekMinus5Mins && generated <= thisTimeLastWeek) {
            return true
          }
        })

        const qr_code_scans_in_last_5_mins = todaysStats.filter(s => {
          const generated = new Date(s.generated)
          if( generated >= timeNowMinus5Mins && generated <= timeNow) {
            return true
          }
        })


        if(qr_code_scans_compared_to_this_time_last_week && qr_code_scans_in_last_5_mins){
          // let qr_code_scans_compared_to_this_time_last_week = thisDayLastWeeksStats[index]

          // console.log('qr_code_scans_compared_to_this_time_last_week')
          // console.log(qr_code_scans_compared_to_this_time_last_week)

  //         console.log('qr_code_scans_in_last_5_mins')
  //         console.log(qr_code_scans_in_last_5_mins)

  //         console.log('latestStats.qr_code_scans_today')
  //         console.log(latestStats.qr_code_scans_today)

  //         console.log('latestStats')
  //         console.log(latestStats)

  //         console.log('todaysStats[todaysStats.length-1]')
  //         console.log(todaysStats[todaysStats.length-1])

          const avg_qr_code_scans_compared_to_this_time_last_week = qr_code_scans_compared_to_this_time_last_week.map(x => x.qr_code_scans_today).reduce((runningTotal, currentValue) => (runningTotal + currentValue)) / qr_code_scans_compared_to_this_time_last_week.length
          // console.log('avg_qr_code_scans_compared_to_this_time_last_week')        
          // console.log(avg_qr_code_scans_compared_to_this_time_last_week)

          const avg_qr_code_scans_in_last_5_mins = qr_code_scans_in_last_5_mins.map(x => x.qr_code_scans_today).reduce((runningTotal, currentValue) => (runningTotal + currentValue)) / qr_code_scans_in_last_5_mins.length
          // console.log('avg_qr_code_scans_in_last_5_mins')
          // console.log(avg_qr_code_scans_in_last_5_mins)


          // let average5MinsTotalThisTimeLastWeek = 
          let percentageOfLastWeek = latestStats.qr_code_scans_today * 100 / qr_code_scans_compared_to_this_time_last_week[qr_code_scans_compared_to_this_time_last_week.length-1].qr_code_scans_today - 100
          console.log(percentageOfLastWeek)

          percentageOfLastWeek = avg_qr_code_scans_in_last_5_mins * 100 / avg_qr_code_scans_compared_to_this_time_last_week - 100

          console.log(percentageOfLastWeek)
          let el = document.getElementById('qr_code_scans_compared_to_this_time_last_week')

          if(percentageOfLastWeek<0){
             el.style.color = 'red'
             el.innerText = '▼' + percentageOfLastWeek.toFixed(1) + '%'
           } else {
             el.style.color = 'green'
             el.innerText = '▲' + percentageOfLastWeek.toFixed(1) + '%'

           }
        }

      }
    }

    updateGraph();  
    
  }
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
  // console.log(todaysStats)
  updateGraph()
}

const thisDayLastWeeksListener = function() {
  thisDayLastWeeksStats = JSON.parse(this.responseText)
  // console.log('thisDayLastWeeksListener')
  // console.log(thisDayLastWeeksStats)
  // console.log(thisDayLastWeeksStats.length)
  displayStats(latestStats);

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



function getThisDayLastWeeksStats(){
  let startOfThisDayLastWeek = new Date()
  startOfThisDayLastWeek.setHours(0)
  startOfThisDayLastWeek.setMinutes(0)
  startOfThisDayLastWeek.setSeconds(0)
  startOfThisDayLastWeek.setMilliseconds(0)
  
  startOfThisDayLastWeek.setDate(startOfThisDayLastWeek.getDate() - 7)
  
  let endOfThisDayLastWeek = new Date(startOfThisDayLastWeek)
  endOfThisDayLastWeek.setHours(23)
  endOfThisDayLastWeek.setMinutes(59)
  endOfThisDayLastWeek.setSeconds(59)
  endOfThisDayLastWeek.setMilliseconds(999)
  
  
//   console.log(startOfThisDayLastWeek)
//   console.log(startOfThisDayLastWeek.toUTCString())

//   console.log(endOfThisDayLastWeek)
//   console.log(endOfThisDayLastWeek.toUTCString())


  const thisDayLastWeeksStatsRequest = new XMLHttpRequest();
  thisDayLastWeeksStatsRequest.onload = thisDayLastWeeksListener;
  thisDayLastWeeksStatsRequest.open('get', '/stats?from=' + startOfThisDayLastWeek.toUTCString() + '&to=' + endOfThisDayLastWeek.toUTCString());
  thisDayLastWeeksStatsRequest.send();  
}

getTodaysStats()
getThisDayLastWeeksStats()


const previousDaysStatsListener = function() {
  previousDaysStats = JSON.parse(this.responseText)
  // console.log(previousDaysStats)
  updateGraph()
  updateHistoricGraph()
}



function getPreviousDaysStats(){
  let startOfTodayNZ = new Date()
  startOfTodayNZ.setHours(0)
  startOfTodayNZ.setMinutes(0)
  startOfTodayNZ.setSeconds(0)
  startOfTodayNZ.setMilliseconds(0)
  
  // console.log('getPreviousDaysStats')
  // console.log(startOfTodayNZ)
  let startPreviousScans = new Date(startOfTodayNZ)
  startPreviousScans.setDate(startPreviousScans.getDate() - previousDaysScansToShow)
  
  // console.log(startPreviousScans)

  
  // console.log(startOfTodayNZ)

  // console.log(startOfTodayNZ.toUTCString())

  const todaysStatsRequest = new XMLHttpRequest();
  todaysStatsRequest.onload = previousDaysStatsListener;
  todaysStatsRequest.open('get', '/stats?from=' + startPreviousScans.toUTCString() + '&granularityMins=60');
  todaysStatsRequest.send();  
}


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

setTimeout(function(){ getPreviousDaysStats() }, 1000);




/*
Chart stuff
*/

var chart
var chartPerQuarterHour
var chartHistoric
var chartHistoricMonth



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
  
  let previousDaysQRCodeScans = []
  
//     console.log(previousDaysStats[0].generated)

//     console.log(new Date(previousDaysStats[0].generated))

//     console.log(new Date(previousDaysStats[0].generated) + 1)

//     console.log(new Date(previousDaysStats[0].generated) + 24 * 60 * 60)


  
  for(var previousDayIndex = 0; previousDayIndex <= previousDaysScansToShow; ++previousDayIndex){
    
    let startOfDayWindow = new Date()
    startOfDayWindow.setHours(0)
    startOfDayWindow.setMinutes(0)
    startOfDayWindow.setSeconds(0)
    startOfDayWindow.setMilliseconds(0)  
    startOfDayWindow.setDate(startOfDayWindow.getDate() - (previousDayIndex))
    let endOfDayWindow = new Date(startOfDayWindow)
    endOfDayWindow.setHours(23)
    endOfDayWindow.setMinutes(59)
    endOfDayWindow.setSeconds(59)
    endOfDayWindow.setMilliseconds(9999)  

//     console.log('startOfDayWindow')

//     console.log(startOfDayWindow)


//     console.log('endOfDayWindow')

//     console.log(endOfDayWindow)




    
    previousDaysQRCodeScans[previousDayIndex] = previousDaysStats
      .filter(data => new Date(data.generated) <= endOfDayWindow && new Date(data.generated) >= startOfDayWindow)
      .map(data => {
        let retVal = {x: new Date(data.generated), y: data.qr_code_scans_today}
        
        retVal.x.setDate(retVal.x.getDate() + previousDayIndex);
        
        return retVal

        // return {x: new Date(data.generated + (previousDayIndex * 24 * 60 * 60 )), y: data.qr_code_scans_today}

      })

  }
  
  
  
  let barChartPeriod =15 // mins
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

  let startOfWorkingDayNZ = new Date()
  startOfWorkingDayNZ.setHours(6)
  startOfWorkingDayNZ.setMinutes(0)
  startOfWorkingDayNZ.setSeconds(0)
  startOfWorkingDayNZ.setMilliseconds(0)

  let endOfWorkingDayNZ = new Date(startOfTodayNZ)
  endOfWorkingDayNZ.setHours(20)
  endOfWorkingDayNZ.setMinutes(0)
  
  const data = {
    labels: labels,
    datasets: [
//       {
//         label: 'QR Scans',
//           // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
//           borderColor: 'rgb(255, 99, 132)',
//           fill: false,
//           // lineTension: 0,       
//           data: todaysQRCodeScans,
//           yAxisId: 'y1'
//       }, {
//         type: 'line',
//         label: 'Manual entries',
//         borderColor: 'rgb(50, 99, 255)',

//         backgroundColor: 'rgb(50, 99, 255)',

//         fill: false,
//         // lineTension: 0,       
//         data: todaysManualEntries,
//         yAxisId: 'y2'
//       }
    ]
  };
  
  var previousDayColours = [
    // 'rgb(255, 99, 132)',
    'white',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
    'red'
  ]

  var previousDayWidths = [
    4, 2, 2, 2, 2, 2, 2, 5
  ]

  var previousDayDashes = [
    [],
    [1],
    [1],
    [1],
    [1],
    [1],
    [1],
    []
  ]




  for(var previousDayIndex = 0; previousDayIndex <= previousDaysScansToShow; ++previousDayIndex){

    var previousDay = new Date(startOfTodayNZ)
    previousDay.setDate(previousDay.getDate()-(previousDayIndex))
    
    var dataset = {
      label: previousDay.toString().substr(0, 3),
      // borderColor: 'rgba(255, 99, 132, ' + ((previousDaysScansToShow - (previousDayIndex/2))/(previousDaysScansToShow)).toString() + ')',
      borderColor: previousDayColours[previousDayIndex],
      borderWidth: previousDayWidths[previousDayIndex],
      borderDash: previousDayDashes[previousDayIndex],

      // borderWidth: (7 - previousDayIndex)/2,

      // borderWidth: (7 - previousDayIndex)/2,

      // borderDash: [1, 3],

      // borderDash: [1, previousDayIndex ],

      fill: false,
      data: previousDaysQRCodeScans[previousDayIndex],
    }
    

    if(previousDaysQRCodeScans[previousDayIndex] && previousDaysQRCodeScans[previousDayIndex].length>0){
      // dataset.label = previousDaysQRCodeScans[previousDayIndex][0].x.toString().substr(0,3)
    }

    // console.log(dataset.label)
    // console.log(dataset.borderColor)
    // console.log(previousDaysQRCodeScans[previousDayIndex])

    data.datasets.push(dataset)

  }    

  data.datasets[0].label = 'Today'


  const config = {
    type: 'line',
    data: data,
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
          type: 'time',
          ticks: { 
            unit: 'hour',
            // min: startOfWorkingDayNZ,
            // max: endOfWorkingDayNZ
          },
        }],
        
       yAxes: [
         {
          ticks: {
            min: 0,
            max: 3000000,
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
        // backgroundColor: 'white',
        // borderColor: 'white',

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
              min: 0,
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

  let historicQRCodeScansFromAPI = previousDaysStats.map(data => {
    return {
      // x: new Date(data['Date/Time To']), 
      x: new Date(
        data.generated
        // data['Date/Time To'].toString().substr(6, 4) + '-' + 
        // data['Date/Time To'].toString().substr(3, 2) + '-' + 
        // data['Date/Time To'].toString().substr(0, 2) 
      ), 
      y: data.qr_code_scans_today
    }
  });
  
  // console.log('historicQRCodeScansFromAPI.length')
  // console.log(historicQRCodeScansFromAPI.length)

  historicQRCodeScansFromAPI = historicQRCodeScansFromAPI.filter((element, index, array) => {
    if(index < array.length-1){
      if(element.x.getDate() != array[index+1].x.getDate()){
        return true
      }
    } 
  } )
  // console.log(historicQRCodeScansFromAPI.length)
  
  // console.log('historicQRCodeScansFromAPI')
  // console.log(historicQRCodeScansFromAPI)
  
  // historicQRCodeScans.push({x: new Date(), y: latestStats.qr_code_scans_today})
  
  const data = {
    // labels: labels,
    datasets: [
      {
        label: 'from MoH spreadsheet (12pm - 12pm)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScans
      }
    ]
  };


  const dataPrevMonth = {
    // labels: labels,
    datasets: [
      {
        label: 'from API (12am - 12am)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'white',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScansFromAPI
      },
      {
        label: 'from MoH spreadsheet (1pm - 1pm)',
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
    // data_: data.datasets[0],
    options: {
      elements: { point: { radius: 0 } },
      
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
  
  var oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth()-1)
  
  const configHistoricMonth = {
    type: 'line',
    // data,
    options: {
      // elements: { point: { radius: 0 } },
      // lineTension: 0, 

      scales: {
        xAxes: [{
          type: 'time',
          time: { 
            unit: 'day',
            min: oneMonthAgo
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

  
  if(chartHistoricMonth==null){
    chartHistoricMonth = new Chart(
      document.getElementById('chartHistoricMonth'),
      configHistoricMonth
    )
  } else {
    chartHistoricMonth.config.data = dataPrevMonth;
    chartHistoricMonth.update(/*{mode: 'none'}*/);
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



