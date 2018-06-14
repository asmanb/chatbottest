'use strict'


const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')


const app = express()

app.set('port', (process.env, port || 5000))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.get('/', function(req,res){

res.send("HI")
})


app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "mwritetk"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });
  
  app.listen(app.get('port'),function(){
    console.log("running port")
  })

