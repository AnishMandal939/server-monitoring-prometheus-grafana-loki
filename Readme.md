## Server monitoring with Grafana Prometheus and Loki

Prerequisites: 
  - basics of : 
    - nodejs and express
    - docker

### Learning new :
  - Server logging with Prometheus

  - Server monitoring with Grafana

## Why de we require monitoring and logging 
  - The basics terminology of making use of it is that anytime if our server goes down then we normally throw `Internal server Error` 
  - let's assume if we have a large system developed & if anything goes wrong with the system how can we know what caused an issue, basically we might be unable to figure out issue.
  - logging monitoring helps you visualize the system log
    - creating central monitoring system
      - and tell all services which are up and running push your metrices at central monitoring system and we can pull all metrics from central monitoring system 
      - monitoring can be:
        - cpu, ram, memory leak, latency spike, server error etc.
        - we can easily track issue where and what went wrong


##                      Monitoring

  - Metrics                    
  metrics are like numbers,
  latency in req, res, memory, concurent request, memory usage, cpu usage

  Log Collection:
     - are those which logs on our server runtime (eg: console.log())


#### Set up monitoring for metrics: 
  - Prometheus : 
    - npm i prom-client
    - default run on port 9090
    - start server
    - this server particularly scraps logs from port 8000 (nodejs server)
    
##                   Setup Prometheus server
  - create file prometheus-config.yml
    global:
      scrape_interval: 4s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ["<NDOEJS_SERVER_ADDRESS>"]

  - create docker-compose to run prometheus
  version: "3"

services:
  prom-server:
    image: prom/prometheus
    ports:
      - 9090:9090
    volumes:
      - ./prometheus-config.yml:/etc/prometheus/prometheus.yml

  - run docker file
    - docker compose up 
      : this will start pulling prom server if not available and start it
  
  - to verify it open docker client (desktop) and look for running image of prometheus and click on it

  after cliking link you will navigate to browser and go to status and click target(link) and you will see your targets


###### Now prometheus server is up and running but how can we visualize it, for this we have (Grafana)


###                     Visualize 'Grafana'
  - this will interact with prometheus server and generates charts, grapgs etc.

  - setup:
    - we'll be using open source version of Grafana
      - docker run -d -p 3000:3000 --name=grafana grafana/grafana-oss
      - if image is not available it will pull it and start grafana server ( see in docker client)
       = username and password (admin , admin)
       -  you will then enter to grafana dashboard
        - add your first data source
          - select prometheus
            - add host : your ip address do not use localhost; because prometheus is running in docker
            - save and test
          - create dashboard:
             - add visualization
              - select prometheus - because we have only one data source
             -  select metrics:
                - cpu_seconds, active_resources, 
                - click on run queries (we can selct different charts)

          ### grafana nodejs dashboard : https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/
          copy id from website ; you'll see it in homepage: 11159
          navigate to your grafana running server and import (selected id: 11159)

####                  Log Collection : (Grafana Loki)
  - we'll push all console.log() in CMS(central monitoring system : i.e grafana loki) and pull grafana loki from grafana
  - to work with this run services: grafana loki
    - 3. Setup Loki Server  : docker run -d --name=loki -p 3100:3100 grafana/loki
    - using winston-loki npm package to push
      - npm i winston-loki winston
### Steps
  - 1. Nodejs and express server setup with basics functionality
  - 2. docker setup and prometheus setup for prometheus Server

### Overview
  - prometheus: for metrics collection
  - grafana   : for visualization
  - loki      : for log collection
