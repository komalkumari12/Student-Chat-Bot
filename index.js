const mongoose = require('mongoose');
const express = require("express");
const http = require('http');
const path = require("path");
const ai = require("clever-bot-api")

const app = express();

const server = http.createServer(app);
app.use(express.urlencoded(true))

let URI = "mongodb+srv://komal:komal123@cluster0.gxdmu.mongodb.net/BotDatabase?retryWrites=true&w=majority";

mongoose.connect(URI);
app.use(express.urlencoded(true))
 
app.use(express.static(__dirname + '/static/'));

app.set('view engine', 'pug')

app.set('views', path.join(__dirname, 'views'))


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'), () => {
    console.log("error in connection to database");
});
db.once('open', function () {
    console.log(" connected to database");
});


const questionsSchema = new mongoose.Schema({
    Question: {
        type: String,
        uppercase: true,

    },
    Answer: {
        type: String,
        uppercase: true,
    }
});


const questions = mongoose.model('questions', questionsSchema);


app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    let text = req.body.query;
    questions.findOne({
        Question: {
            $regex: text
        }
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                let question = data.Question;
                let answer = data.Answer;
                res.render('index', {
                    question: question,
                    answer: answer
                });
            } else {
                ai(text).then(function (response) {
                    let answer = response;
                    res.render('index', {
                        question: text,
                        answer: answer
                    });
                }
                ).catch(error => {
                    let answer = "Sorry, I don't know the answer to that question";
                    res.render('index', {
                        question: text,
                        answer: answer
                    });
                })
            }
        }
    });
})
const PORT = process.env.PORT || 9000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));