'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()); // creates express http server


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require('request');



// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);


            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }







        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});



// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "asmanbaheh"

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



// Handles messages events
function handleMessage(sender_psid, received_message) {

    let response;



    // Check if the message contains text
    if (received_message.text) {
        //console.log('msg is reci');
        // Create the payload for a basic text message
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an image!`
        }
    }
    else if (received_message.attachments) {

        // Gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    
    switch (received_message.text) {
        case 'menu':
            //sendGetStarted(sender_psid);
            response = { "text": "Here's Menu" }
            break;

        default:
            response = { "text": "XXXXX" }
    }
    




    // Sends the response message
    callSendAPI(sender_psid, response);
}

function sendGetStarted(sender_psid) {

    console.log("sendGetStarted is working");
    let response;
    //response = { "text": "Hello ! It's must be your first time with us.  This is a Bot, You can order your food from the options below.  You can also Contact directly to us from the option  We recommended you to read the manual to use the bot perfectly !" }
    ฝฝresponse = { "text": "Hello !" }
    response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
               // "elements": [{
                    "text": "What can I help you?",
                    //"subtitle": "This is a bot",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Order Foods",
                            "payload": "order_food",
                        },
                        {
                            "type": "postback",
                            "title": "Oder Drinks",
                            "payload": "order_drinks",
                        }
                        ,
                        {
                            "type": "postback",
                            "title": "Contact Us",
                            "payload": "contact",
                        }
                    ],
                //}]
            }
        }
    }
    response = { "text": "Hiiii " }

    callSendAPI(sender_psid, response);
}






// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;


    /*
        // Set the response based on the postback payload
        if (payload === 'yes') {
            response = { "text": "Thanks!" }
        } else if (payload === 'no') {
            response = { "text": "Oops, try sending another image." }
        } else if (payload === 'Get Started' || 'get_started') {
            response = { "text": "Recived getstarted!!" }
            console.log("get started from else if");
            sendGetStarted(sender_psid);
        }
        else if (payload === 'order_food' || 'Order Foods') {
            response = { "text": "Now you order foods" }
            console.log("HELLO");
    
        }
        else {
            response = { "text": "NONE" }
        }
    */


    switch (payload) {
        case 'get_started':
            //sendGetStarted(sender_psid);
            console.log("s g");
            break;
        case 'Get Started':
            console.log("s gB");
            break;
        case '<postback_payload>':
            console.log("s pbpl");
            sendGetStarted(sender_psid);
            break;
        case 'order_food':
            console.log("s order");
            response = { "text": "Now you're ordering foods" }
            break;
        case 'order_drinks':
            response = { "text": "Now you're ordering Drinks" }
            break;
        case 'contact':
            response = { "text": "Now you can Contact Us, Just tell us what is borthering you we'll call you back ASAP" }
            break;
        default:
            response = { "text": "It's seems like there's an Issue plese type directly" }
    }


    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);

}






// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}




