import { initApp } from "./server";
import {initHttpsApp} from "./httpsServer";

const port = Number(process.env.PORT) || 4000;
if (process.env.NODE_ENV !== "production") {
    initApp().then(({ app, server }) => {
            console.log("Development Mode");
            server.listen(port, () => {
                console.log(`Server listening at http://localhost:${port}`);
            });
        });
} else {
    initHttpsApp().then(({ app, httpsServer }) => {
            console.log("PRODUCTION Mode");
            httpsServer.listen(port, '0.0.0.0', () => {
                console.log(`Server listening at https://0.0.0.0:${port}`);
            });
        });
}

