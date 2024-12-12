var fs = require('fs');
var join = require('path').join;
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
fs.mkdirSync(`${__dirname}/logs`, { recursive: true });

// 日期
var date = new Date();
// 格式化
var fmt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
console.log(fmt);
// 文件名
var filename = join(__dirname, 'logs/' + fmt + '.log');

var app = express();
app.use(cors({ origin: '*' }))
app.options('*', cors())
app.use(express.json({ limit: '15mb' }))
app.use(bodyParser.urlencoded({
    extended: false
}))

app.post("/log", (req, res) => {
    console.log(JSON.stringify(req.body));
    
    try {
        const exist = fs.existsSync(filename);
        if (exist) {
            fs.appendFileSync(filename, JSON.stringify(req.body.data) + '\n');
        }
        else {
            fs.writeFileSync(filename, '');
        }

        return res.json({
            result: "OK",
            code: 200,
            data: 'ok ' + Date.now()
        })
    } catch (e) {
        return res.json({
            result: "Error",
            code: 500,
            data: " " + e
        })
    }

});


  
function test(){
    try {
        const exist = fs.existsSync(filename);
        if (exist) {
            fs.appendFileSync(filename, JSON.stringify('hello') + '\n');
        }
        else {
            fs.writeFileSync(filename, '');
        }
    } catch (e) {
    
    }
} 
// test();

app.listen(8999, () => {
    console.log('server started at http://localhost:8999');
})

