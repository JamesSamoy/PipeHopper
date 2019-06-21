var express = require('express');
//var page = require('./Desktop/PipeHopper/index');
var fs = require('fs');
var bodyParser = require('body-parser');
var readline = require('readline');
const app = express();
app.listen(8080, () => console.log('listening at 8080'));
app.use(express.static('./pages'));
app.use(express.json());
app.use(bodyParser());

//read and write functions were simple functions to test read/write capabilities with files
function read(){
    fs.readFile('./Desktop/PipeHopper/temp.txt', 'utf8', function(err, data) {
        if(err)
            return console.log(err);
        console.log(data);
    });
}

function write(data){
    fs.writeFile('./Desktop/PipeHopper/data.txt', data, (err) => {
        if(err) console.log(err);
        console.log('Successfully written to file!');
        response.json(data);
    });
}

//this is function handles the GET requests from client side, pulls data from the file in string format and converts and stores
//the data in JSON format into an array, passing back an array of data
app.get('/api', function(req, res) {

    var fileStream = fs.createReadStream('./data.txt');
    var data = "";
    console.log('recieved GET request...')

    fileStream.on('readable', function() {
        //this function reads chunks of data and emits newLine event when \n is found
        data += fileStream.read();
        while(data.indexOf('\n') >= 0){
            fileStream.emit('newLine', data.substring(0,data.indexOf('\n')));
            data = data.substring(data.indexOf('\n')+1);
        }
    });

    fileStream.on('end', function(){
        //this function sends to newLine event the last chunk of data and tells it
        //that the file has ended
        fileStream.emit('newLine', data, true);
    });

    var statement = [];

    fileStream.on('newLine', function(line_of_text, end_of_file){
        //this is the code where you handle each line
        //line_of_text = string which contains one line
        //end_of_file = true if the end of file has been reached
        statement.push(JSON.parse(line_of_text));
        if(end_of_file){
            //console.dir(statement);
            res.json(statement);
            console.log('Data successfully sent!');
        }
    });
});

//this function handles POST requests from the client side and takes the data that is passed in JSON format and converts it into
//string format and stores the data as strings into the file.
app.post('/api', function(req, res) {
    console.log('I got a request!');
    var data = JSON.stringify(req.body);
    console.log(data);
    fs.appendFile('./data.txt', data +'\r\n', function(err){
        if(err) throw err;
        console.log("Data successfully saved!");
    });
   /* fs.writeFile('./temp.txt', data, (err) => {
        console.log('Successfully written to file!');
    });*/
});