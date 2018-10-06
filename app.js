const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3001;

const Handlebars = require('handlebars');
const csv = require('./csv.js');

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/Chart.bundle.js') {
    fs.readFile('./node_modules/chart.js/dist/Chart.bundle.js', null, function(err, data) {
      if (err) {
        res.writeHead(404);
        res.write('something went wrong');
        console.log(err)
      } else {
        res.write(data) 
      }
      res.end()
    })
  } else if (url === '/csv.js') {
    fs.readFile('./csv.js', null, function(err, data) {
      if (err) {
        res.writeHead(404);
        res.write('something went wrong');
        console.log(err)
      } else {
        res.write(data) 
      }
      res.end()
    })
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    fs.readFile('./chart.hbs', null, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.write('something went wrong');
        console.log(err)
      } else {
        const template = Handlebars.compile(data.toString());
        // const context = { yearTotal2008: 140146180, 
        //                   yearAvg2008ByPatient: 2800,
        //                   yearTotal2009: 168317230, 
        //                   yearAvg2009ByPatient: 2700
        //                 }
        // const templateWithContext = template(context)
        function getChartData() { 
          return csv.produceChartData()
            .then(result => {
              const context = { yearTotal2008: result[2008][0], 
                                yearAvg2008ByPatient: result[2008][1],
                                yearTotal2009: result[2009][0],
                                yearAvg2009ByPatient: result[2009][1],
                                yearTotal2010: result[2010][0],
                                yearAvg2010ByPatient: result[2010][1]
                              }
              return template(context);;
              
            })
        }
        getChartData()
          .then(templateWithContext => { res.end(templateWithContext) });
      }
    })
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});