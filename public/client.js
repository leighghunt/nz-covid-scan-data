/* globals moment Chart */

var io = window.io;
var socket = io.connect(window.location.hostname);

var latestStats = null
// var stats = []
var todaysStats = []
var thisDayLastWeeksStats = []

var previousDaysStats = []

var historicStats = []

var kebabs = false;

if(window.location.href.endsWith('kebabs')){
  kebabs = true;
}

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


    // Average approach 2
    {

      console.log('Average approach 2')


      let thisTimeLastWeek = new Date()
      thisTimeLastWeek.setDate(thisTimeLastWeek.getDate()-7)
      // console.log(thisTimeLastWeek)

      let timeNow = new Date()

      if(thisDayLastWeeksStats && thisDayLastWeeksStats.length>0){
        const lastWeekIndex = thisDayLastWeeksStats.findIndex(s => {
          if(s!=null){  // Missing previous week data
            const generated = new Date(s.generated)
            if( generated >= thisTimeLastWeek) {
              return true
            }
          }
        })
        
        if(lastWeekIndex>0){
          const qrScans2 = thisDayLastWeeksStats[lastWeekIndex]
          const qrScans1 = thisDayLastWeeksStats[lastWeekIndex-1]

          
          let dateThisScan = new Date(latestStats.generated)

          let timeThisScanBut7DaysAgo = new Date(dateThisScan)
          timeThisScanBut7DaysAgo.setDate(dateThisScan.getDate()-7)

            console.log('dateThisScan')
            console.log(dateThisScan)

            console.log('timeThisScanBut7DaysAgo')
            console.log(timeThisScanBut7DaysAgo)



          
          let dateScan1 = new Date(qrScans1.generated)
          let dateScan2 = new Date(qrScans2.generated)
          

          let projectedOldFigure = 0
          
          // // At end of time window?
          // if(dateScan2 - timeThisScanBut7DaysAgo == 0){
          //   projectedOldFigure = qrScans2.qr_code_scans_today
          // } else {
          //   // At start of time window?
          //   if(timeThisScanBut7DaysAgo - dateScan1 == 0){
          //     projectedOldFigure = qrScans1.qr_code_scans_today
          //   } else {
          //     // Inside the time window
              projectedOldFigure =  (
                                      ((timeThisScanBut7DaysAgo - dateScan1) / (dateScan2 - dateScan1)) 
                                      * (qrScans2.qr_code_scans_today - qrScans1.qr_code_scans_today)
                                    )
                                    + qrScans1.qr_code_scans_today
            // }
          // }
          
          
          if(timeThisScanBut7DaysAgo < dateScan1
             || timeThisScanBut7DaysAgo > dateScan2){
            console.warn("Date not in between two scans as expected")
            console.log('dateThisScan')
            console.log(dateThisScan)

            console.log('qrScans1')
            console.log(qrScans1)
            console.log('qrScans2')
            console.log(qrScans2)
            console.log('latestStats')
            console.log(latestStats)


            console.log('dateScan2 - dateScan1')
            console.log(dateScan2 - dateScan1)
            console.log('dateScan2 - timeThisScanBut7DaysAgo')
            console.log(dateScan2 - timeThisScanBut7DaysAgo)
            console.log('timeThisScanBut7DaysAgo - dateScan1')
            console.log(timeThisScanBut7DaysAgo - dateScan1)
  
            console.log('projectedOldFigure')
            console.log(projectedOldFigure)

          }
          

          percentageOfLastWeek = latestStats.qr_code_scans_today * 100 / projectedOldFigure - 100
        }
      }
    }

    console.log(percentageOfLastWeek)
    let el = document.getElementById('qr_code_scans_compared_to_this_time_last_week')

    if(percentageOfLastWeek<0){
       el.style.color = 'red'
       el.innerText = '▼' + percentageOfLastWeek.toFixed(1) + '%'
     } else {
       el.style.color = 'green'
       el.innerText = '▲' + percentageOfLastWeek.toFixed(1) + '%'

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

  let endOfTodayNZ = new Date(startOfTodayNZ)
  endOfTodayNZ.setHours(23)
  endOfTodayNZ.setMinutes(59)
  endOfTodayNZ.setSeconds(59)
  endOfTodayNZ.setMilliseconds(999)
  
  // console.log(startOfTodayNZ)

  // console.log(startOfTodayNZ.toUTCString())


  // if(kebabs){
  //   // Are we after 10pm? Assume tonight - if before 10pm - assume last night.
  //   let now = new Date()
  //   if(now.getHours() < 22){
  //     startOfTodayNZ.setDate(startOfTodayNZ.getDate() - 1)
  //     endOfTodayNZ.setDate(endOfTodayNZ.getDate() - 1)
  //   }
  //   // set to 11pm to 3am next day
  //   startOfTodayNZ.setHours(23)
  //   endOfTodayNZ.setDate(endOfTodayNZ.getDate() + 1)
  //   endOfTodayNZ.setHours(3)
  // }
  

  const todaysStatsRequest = new XMLHttpRequest();
  todaysStatsRequest.onload = todaysStatsListener;
  todaysStatsRequest.open('get', '/stats?from=' + startOfTodayNZ.toUTCString() + '&to=' + endOfTodayNZ.toUTCString());
  todaysStatsRequest.send();  
}

getTodaysStats()

  // if(kebabs){
  //   var startOfKebabs = new Date(startOfTodayNZ)
  //   startOfKebabs.setHours(23)
  //   var endOfKebabs = new Date(startOfTodayNZ)
  //   endOfKebabs.setDate(endOfKebabs.getDate()+1)
  //   endOfKebabs.setHours(3);
  //   var startOfKebabs7DaysAgo = new Date(startOfKebabs);
  //   startOfKebabs7DaysAgo.setDate(startOfKebabs7DaysAgo.getDate()-7);
  //   var endOfKebabs7DaysAgo = new Date(endOfKebabs);
  //   endOfKebabs7DaysAgo.setDate(endOfKebabs7DaysAgo.getDate()-7);

  //   // configPerQuarterHour.options.scales.yAxes[0].ticks.max = 1000;
  //   // configPerQuarterHour.options.scales.xAxes[0].time.min = startOfKebabs;
  //   // configPerQuarterHour.options.scales.xAxes[0].time.max = endOfKebabs;

  //   // console.log(increasesByPeriod[0])
  //   console.log(increasesByPeriod.length)
  //   console.log(increasesByPeriod7DaysAgo.length)
  //   increasesByPeriod = increasesByPeriod.filter(data => data.x <= endOfKebabs && data.x >= startOfKebabs)
  //   increasesByPeriod7DaysAgo = increasesByPeriod7DaysAgo.filter(data => data.x <= endOfKebabs7DaysAgo && data.x >= startOfKebabs7DaysAgo)
  //   console.log(increasesByPeriod.length)
  //   console.log(increasesByPeriod7DaysAgo.length)
  // }



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
  
  // if(kebabs){
  //   // Are we after 10pm? Assume tonight - if before 10pm - assume last night.
  //   let now = new Date()
  //   if(now.getHours() < 22){
  //     startOfThisDayLastWeek.setDate(startOfThisDayLastWeek.getDate() - 1)
  //     endOfThisDayLastWeek.setDate(endOfThisDayLastWeek.getDate() - 1)
  //   }
  //   // set to 11pm to 3am next day
  //   startOfThisDayLastWeek.setHours(23)
  //   endOfThisDayLastWeek.setDate(endOfThisDayLastWeek.getDate() + 1)
  //   endOfThisDayLastWeek.setHours(3)
  // }  
  
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
    
    if(obj==null || obj.generated == null){
      return null
    }
  
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

  console.log('updateGraph: todaysStats')
  console.log(todaysStats)
  
  if(todaysStats.Length == 0 || todaysStats[0] == null){
    console.error('todaysStats empty!')
    return
  }

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

  let thisDayLastWeeksQRScansGroupByPeriod = groupByDuration(thisDayLastWeeksStats, barChartPeriod)


  
  console.log('todaysQRScansGroupByPeriod')
  console.log(todaysQRScansGroupByPeriod)
  console.log('thisDayLastWeeksQRScansGroupByPeriod')
  console.log(thisDayLastWeeksQRScansGroupByPeriod)



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
  
  prevTotal = 0
  let increasesByPeriod7DaysAgo = []
  if(thisDayLastWeeksQRScansGroupByPeriod!=null)
  {
    increasesByPeriod7DaysAgo = thisDayLastWeeksQRScansGroupByPeriod.map(function (element, index, array) {


        let data = {
          x: new Date(element.generated),
          y: element.qr_code_scans_today - prevTotal      
        }

        data.x.setDate(data.x.getDate()+7)

        //let data = element.qr_code_scans_today - prevTotal      

        prevTotal = element.qr_code_scans_today

        return data
      } 
    )
  }


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
            // max: 3000000,
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
  
  // if(kebabs){
  //   var startOfKebabs = new Date(startOfTodayNZ)
  //   startOfKebabs.setHours(23)
  //   var endOfKebabs = new Date(startOfTodayNZ)
  //   endOfKebabs.setDate(endOfKebabs.getDate()+1)
  //   endOfKebabs.setHours(3);
  //   var startOfKebabs7DaysAgo = new Date(startOfKebabs);
  //   startOfKebabs7DaysAgo.setDate(startOfKebabs7DaysAgo.getDate()-7);
  //   var endOfKebabs7DaysAgo = new Date(endOfKebabs);
  //   endOfKebabs7DaysAgo.setDate(endOfKebabs7DaysAgo.getDate()-7);

    // configPerQuarterHour.options.scales.yAxes[0].ticks.max = 1000;
  //   // configPerQuarterHour.options.scales.xAxes[0].time.min = startOfKebabs;
  //   // configPerQuarterHour.options.scales.xAxes[0].time.max = endOfKebabs;

  //   // console.log(increasesByPeriod[0])
  //   console.log(increasesByPeriod.length)
  //   console.log(increasesByPeriod7DaysAgo.length)
  //   increasesByPeriod = increasesByPeriod.filter(data => data.x <= endOfKebabs && data.x >= startOfKebabs)
  //   increasesByPeriod7DaysAgo = increasesByPeriod7DaysAgo.filter(data => data.x <= endOfKebabs7DaysAgo && data.x >= startOfKebabs7DaysAgo)
  //   console.log(increasesByPeriod.length)
  //   console.log(increasesByPeriod7DaysAgo.length)
  // }


  
  const dataPerQuarterHour = {
    labels: labelsByPeriod,
    //labels: Array(4 * 24).fill(''),
    datasets: [
      {
        label: 'Scans/quarter hour this day last week',
        // backgroundColor: 'rgba(200, 45, 72, 0.5)',
        // borderColor: 'rgba(255, 99, 132, 0.5)',
        
        // backgroundColor: 'rgba(255, 0, 0, 0.5)',
        // borderColor: 'white',
        
        backgroundColor: 'rgba(255, 99, 132, 0.0)',
        borderColor: 'rgba(255, 99, 132, 0.3)',
        // borderColor: 'rgba(255, 0, 0, 0.1)',

        borderWidth: 2,
        fill: false,
        lineTension: 0,       
        data: increasesByPeriod7DaysAgo,
      },
      {
        label: 'Scans/quarter hour',
        // backgroundColor: 'rgb(255, 99, 132)',
        // borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'white',
        borderColor: 'white',
        borderWidth: 2,

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
          stacked: true,
          time: { 
            unit: 'hour',
            // min: startOfTodayNZ,
            // max: endOfTodayNZ
          },
        }],
        
       yAxes: [
         {
           stacked: false,
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

  if(kebabs){
    configPerQuarterHour.options.scales.yAxes[0].ticks.max = 1000;
  }


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
  let historicBluetoothActiveDevices = historicStats.map(data => {
    return {
      // x: new Date(data['Date/Time To']), 
      x: new Date(
        data['Date/Time To'].toString().substr(6, 4) + '-' + 
        data['Date/Time To'].toString().substr(3, 2) + '-' + 
        data['Date/Time To'].toString().substr(0, 2) 
      ), 
      y: parseInt(data["Bluetooth Active (24hr)"].replace(/,/g, ''))
    }
  });
  let historicActiveDevices = historicStats.map(data => {
    return {
      // x: new Date(data['Date/Time To']), 
      x: new Date(
        data['Date/Time To'].toString().substr(6, 4) + '-' + 
        data['Date/Time To'].toString().substr(3, 2) + '-' + 
        data['Date/Time To'].toString().substr(0, 2) 
      ), 
      y: parseInt(data["Active Devices"].replace(/,/g, ''))
    }
  });
  
  console.log(historicBluetoothActiveDevices[0]);

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
  
  let historicBluetoothActiveFromAPI = previousDaysStats.map(data => {
    return {
      // x: new Date(data['Date/Time To']), 
      x: new Date(
        data.generated
        // data['Date/Time To'].toString().substr(6, 4) + '-' + 
        // data['Date/Time To'].toString().substr(3, 2) + '-' + 
        // data['Date/Time To'].toString().substr(0, 2) 
      ), 
      y: data.people_with_bluetooth_tracing_active_today
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

  // historicBluetoothActiveFromAPI = historicBluetoothActiveFromAPI.filter((element, index, array) => {
  //   if(index < array.length-1){
  //     if(element.x.getDate() != array[index+1].x.getDate()){
  //       return true
  //     }
  //   } 
  // } )

  
  // console.log(historicQRCodeScansFromAPI.length)
  
  // console.log('historicQRCodeScansFromAPI')
  // console.log(historicQRCodeScansFromAPI)
  
  // historicQRCodeScans.push({x: new Date(), y: latestStats.qr_code_scans_today})
  
  const data = {
    // labels: labels,
    datasets: [
      {
        label: 'Scans',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScans
      },
      {
        label: 'Active Bluetooth (24 hours)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(99, 99, 255)',
        fill: false,
        // lineTension: 0,       
        data: historicBluetoothActiveDevices
      },
      {
        label: 'Active Devices',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(99, 255, 99)',
        fill: false,
        // lineTension: 0,       
        data: historicActiveDevices
      }
    ]
  };


  const dataPrevMonth = {
    // labels: labels,
    datasets: [
      {
        label: 'Scans from API (12am - 12am)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'white',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScansFromAPI
      },
      {
        label: 'Scans from MoH spreadsheet (1pm - 1pm)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        // lineTension: 0,       
        data: historicQRCodeScans
      },
      {
        label: 'Active Bluetooth (from MoH spreadsheet)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(99, 99, 255)',
        fill: false,
        // lineTension: 0,       
        data: historicBluetoothActiveDevices
      },
      {
        label: 'Active Bluetooth (from API)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(99, 99, 255)',
        fill: false,
        // lineTension: 0,       
        borderDash: [1, 3],
        data: historicBluetoothActiveFromAPI
      },
      {
        label: 'Active Devices (from MoH spreadsheet)',
        // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: 'rgb(99, 255, 99)',
        fill: false,
        // lineTension: 0,       
        data: historicActiveDevices
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
      elements: { point: { radius: 0 } },
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



