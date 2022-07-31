const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa-cors');
const Router = require('koa-router');
const WS = require('ws');

const Message = require('./Message');
const User = require('./User');

const app = new Koa(); 
const router = new Router();

const userArr = [

];

const messages = [
    new Message('admin', 'Chat server started', new Date()),
]

app.use(cors());

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
}));

router.get('/index', async (ctx)=>{
    ctx.response.body = 'hello';
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
const wsServer = new WS.Server({ server }, CLIENTS = []);

wsServer.on('connection', (ws, req) =>{
    ws.on('close', function close() {
        const ind = CLIENTS.findIndex((elem) => elem === ws);
        userArr.splice(ind, 1);
        CLIENTS.splice(ind, 1);
        console.log('close', CLIENTS.length);
    });
    ws.on('message', (msg)=> {
        const request = JSON.parse(msg);
        let response;
        if(request.login) {
            const userLogged = userArr.some((user) => user.name === request.login);
            if(userLogged) {
                response = false;
            } else {
                CLIENTS.push(ws);
                const userId = CLIENTS.findIndex((elem) => elem === ws);
                userArr.push(new User(request.login, userId));
                response = userArr;
            }
        } 
        else if (request.message) {
            const UserId = CLIENTS.findIndex((elem) => elem === ws);
            messages.push(new Message(userArr[UserId].name, request.message, new Date(), UserId));
            response = messages;
        } else if (request.messagesList) {
            response = messages;
        }
        [...wsServer.clients].filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify(response)));
        console.log('message', CLIENTS.length);

    });
});
