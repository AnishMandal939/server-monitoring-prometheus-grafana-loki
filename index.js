
const express = require('express');

// response-time
const responseTime = require('response-time');

//setup prom-client prometheous
const client = require('prom-client'); // metric collection

//logger setup
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const options = {
  transports: [
    new LokiTransport({
      labels: {
        appName: 'express'
      },
      host: "http://127.0.0.1:3100"
    })
  ]
};
const logger = createLogger(options);

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

// total req counter
const totalReqCounter = new client.Counter({
  name: 'total_req',
  help: 'Tells total req'
});

// create middleware and make use of package: npm i response-time
app.use(responseTime((req, res, time) => {
// on every req we increase totalReqCounter
    totalReqCounter.inc()
    reqResTime.labels({
    method: req.method, 
    route: req.url,
    status_code: req.statusCode
  }).observe(time)
}));

app.get("/", (req, res) => {
  logger.info('Req came on / router')
  return res.json({message: `Hello from express server`});
});

app.get('/slow', async(req, res) => {
  try {
    logger.info("Req came on /slow router")
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Heavy task completed in ${timeTaken}ms`,
    })
  } catch (error) {
    logger.error(error.message);
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
