
const express = require('express');
//setup prom-client prometheous
const client = require('prom-client'); // metric collection

const {doSomeHeavyTask} = require('./util.js');

const app = express();
const PORT = process.env.PORT || 8000;

// create a collection for metric
const collectDefaultMetrics = client.collectDefaultMetrics;

// call function
collectDefaultMetrics({register: client.register});

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
