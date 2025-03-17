import { initApp } from "./server";
import https from 'https';
import http from 'http';
import fs from 'fs';

const port = Number(process.env.PORT) || 3000;

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
        https.createServer(options, app).listen(port, '0.0.0.0', () => {
            console.log(`Server listening at https://0.0.0.0:${port}`);
        });
    }
});
