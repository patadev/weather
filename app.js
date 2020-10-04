const express = require('express');
const https = require("https");
const bodyParser = require('body-parser');
require('dotenv').config()


const openweathermap_key = process.env.openweathermap_key;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))


const htmlBuilder = (params) => {

 const { temperature, city, unit } = params;

 const unit_symbol = (unit == 'metric') ? 'C' : 'F';
 const html = `<p>The temperature in ${city} is ${temperature}  ${unit_symbol}</p>`;
 return html;

}


const urlBuilder = (params) => {

 const { city, unit, apiKey } = params;

 return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

}

const weatherApi = (params) => {

 const url = urlBuilder(params);

 return new Promise((resolve, reject) => {

  https.get(url, function (response) {

   response.on('data', function (data) {

    try {
     const weatherData = JSON.parse(data);
     resolve(weatherData);
    }
    catch (e) {
     console.log('answering bad...');
     reject();
    }

   })
  })


 });


}

app.post('/', async (req, res) => {

 const city = req.body.city;
 const unit = req.body.unit;
 const mode = req.body.mode;

 const weatherRes = await weatherApi({ city: city, unit: unit, apiKey: openweathermap_key });
 //console.log(weatherRes);
 const temp = weatherRes.main.temp;
 const outObj = { "temperature": temp, city: city, unit: unit };

 const out = (mode == 'json') ? outObj : htmlBuilder(outObj);


 res.status(200).send(out);
})



app.get('/', function (req, res) {

 res.sendFile(__dirname + '/index.html')

})





app.listen(3000, function () {
 console.log('Server is running on port 3000.')
});

