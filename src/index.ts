import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import fs from "fs";
import { URL } from 'node:url';
import { getData } from "./search";

const myServer : Server = createServer((req : IncomingMessage, res : ServerResponse) => {
    const log = `${new Date().toLocaleString()} & ${req.url} : New Request Recieved\n`;
    const myUrl = new URL(req.url || "/", `http://${req.headers.host}`);


    fs.appendFile('log.txt', log, (error) => {
        switch(myUrl.pathname){
            case('/'):
                res.end(`You Are HomePage Now`);
                break;
            case('/about'):
                const search = myUrl.searchParams.get('search_query');
                res.end(`This is About page ${search}`);
                break;
            case('/search'):
                getData(req, res, myUrl);
                break;     
            default :
                res.end(`404 Not Found`);           
        }
    });
})

myServer.listen(8000, () => console.log('Server is Running.....'))