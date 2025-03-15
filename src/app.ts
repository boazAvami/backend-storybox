import { initApp } from "./server";
import https from 'https';
import http from 'http';
import fs from 'fs';

const port = process.env.PORT;

initApp().then(({ app, server }) => {
    if (process.env.NODE_ENV !== "production") {
        console.log("Development Mode");
        server.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    } else {
        console.log("PRODUCTION Mode");
        const options = {
            key: fs.readFileSync('./client-key.pem'),
            cert: fs.readFileSync('./client-cert.pem'),
        };
        https.createServer(options, app).listen(port, () => {
            console.log(`Server listening at https://localhost:${port}`);
        });
    }
});
