
const express = require('express');

// response-time
const responseTime = require('response-time');

//setup prom-client prometheous
const client = require('prom-client'); // metric collection

const {doSomeHeavyTask} = require('./util.js');

const app = express();
const PORT = process.env.PORT || 8000;

// create a collection for metric
const collectDefaultMetrics = client.collectDefaultMetrics;

// call function
collectDefaultMetrics({register: client.register});

// creating custom metrics
const reqResTime = new client.Histogram({
  name: "https_express_req_res_time",
  help: "This tells how much time is taken by req and res",
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1,50,100,200,400,500,800,1000,2000], // data points
});

// create middleware and make use of package: npm i response-time
app.use(responseTime((req, res, time) => {
    reqResTime.labels({
    method: req.method, 
    route: req.url,
    status_code: req.statusCode
  }).observe(time)
}));

app.get("/", (req, res) => {
  return res.json({message: `Hello from express server`});
});

app.get('/slow', async(req, res) => {
  try {
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Heavy task completed in ${timeTaken}ms`,
    })
  } catch (error) {
    return res.status(500).json({status: `Error`, error: 'Internal server error'})
  }
});

// exposing metrics route
app.get('/metrics', async(req, res) => {
  res.setHeader('Content-Type', client.register.contentType)
  const metrics = await client.register.metrics();
  res.send(metrics);
})

app.listen(PORT, () => {
  console.log(`Express started at http://localhost:${PORT}`);
})
