require('dotenv').config();

const express = require("express");
const app = express();

//add twilio
const twilio = require('twilio');
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN );

//json handling for custom action payload
const bodyParser = require("body-parser")
var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({
	extended:true
}));

// enable CORS so Thoughtspot can connect
const cors = require('cors');
app.use(cors());

// HTTP Methods

app.get("/", function(req, res) {
res.sendFile(__dirname + "/index.html");
});

//you can use this to test your service is running locally
app.post("/helloworld", jsonParser, function(req, res) {
var fname = req.body.firstname;
var lname = req.body.firstname;

console.log(fname);	
	
res.send("Hello " + fname+" "+lname);
});

//WEBHOOK TO HANDLE POST FROM TSE CUSTOM URL ACTION
app.post("/tse", jsonParser, function(req, res) {
    
    //console.log(req.body); 

    if(req.body.hasOwnProperty('__typename')) {
        console.log("Received ThoughtSpot payload of type: "+req.body["__typename"]);
        if(req.body["__typename"] == "ChartViz") {
            //parse data to use in your system
            twilioClient.messages.create({
                body: 'Hello from ThoughtSpot. You viewed '+req.body["name"],
                to: process.env.MY_PHONE_NUMBER,
                from: process.env.TWILIO_PHONE_NUMBER
            })
            .then((message) => console.log("Sent SMS: "+message.sid));
        } 
        else if (req.body["__typename"] == "TableViz") {
             //parse data to use in your system

        } else {
            res.status(400).send({
                message: 'Didnt understand typename.'
             });
        }
    } else {
        res.status(400).send({
            message: 'Missing typename.'
         });
    }


    res.sendStatus(200);
});

//RUN SERVICE ON P8000
app.listen(8000, function(){
console.log("server is running on port 8000");
})
