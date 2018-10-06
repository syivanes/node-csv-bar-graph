const fs = require('fs');
const CsvReadableStream = require('csv-reader');
const csv = require('fast-csv');

const inputStream = fs.createReadStream('sample.csv', 'utf8');

var yearGrandTotals = { 2008: 0,
                        2009: 0,
                        2010: 0 }
                
var yearTotalByPatient = { 2008: {},
                           2009: {},
                           2010: {} }

function yearPatientTally(yearTallyByPatient, patientId, claimAmount) {
  if (yearTallyByPatient[patientId]) {
    yearTallyByPatient[patientId] += claimAmount
  } else {
    yearTallyByPatient[patientId] = claimAmount
  }
}

function averageYearTotalPerPatient(yearTotalClaims, yearTallyByPatient) {
  return new Promise((resolve) => {
    resolve([yearTotalClaims, (yearTotalClaims / Object.keys(yearTallyByPatient).length).toFixed(2)])
  })
}

function between(n, min, max) {
  return ((n >= min) && (n <= max))
}

function appendData(row, yearTotalClaims, yearTallyByPatient) {
  // console.log('*********')
  // console.log('given year total is ' + yearTotalClaims)
  // console.log(parseFloat(row[6]) + ' is supposed to append')
  yearPatientTally(yearTallyByPatient, row[0], parseFloat(row[6]))
  yearTotalClaims += parseFloat(row[6])
}

const readThroughCsv = () => {
  return new Promise((resolve) => {
    inputStream
      .pipe(csv())
      .on('data', function (row) {
        if (between(row[3], 20080101, 20081231)) {
          yearGrandTotals[2008] += parseFloat(row[6])
          yearPatientTally(yearTotalByPatient[2008], row[0], parseFloat(row[6]))
        } else if (between(row[3], 20090101, 20091231)) {
          yearGrandTotals[2009] += parseFloat(row[6])
          yearPatientTally(yearTotalByPatient[2009], row[0], parseFloat(row[6]))
        } else if (between(row[3], 20100101, 20101231)) {
          yearGrandTotals[2010] += parseFloat(row[6])
          yearPatientTally(yearTotalByPatient[2010], row[0], parseFloat(row[6]))
        }
      })
      .on('end', function (data) {
        console.log('end of the read')

        resolve({ yearGrandTotals, yearTotalByPatient });
      })
  })
}

module.exports.produceChartData = () => {
  return readThroughCsv()
    .then(result => {
      return Promise.all([
        averageYearTotalPerPatient(result['yearGrandTotals'][2008], result['yearTotalByPatient'][2008]),
        averageYearTotalPerPatient(result['yearGrandTotals'][2009], result['yearTotalByPatient'][2009]),
        averageYearTotalPerPatient(result['yearGrandTotals'][2010], result['yearTotalByPatient'][2010])
      ])
    })
    .then(result => {
      return {
        2008: result[0],
        2009: result[1],
        2010: result[2]
      }
    })
}

