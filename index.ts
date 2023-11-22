import * as https from "https";
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as cors from "cors";
import * as passport from "passport";

import passport_verify from "./config/passport";
import api from "./routes";

// Config
dotenv.config();
const credentials = {
  key: fs.readFileSync("config/server.key"),
  cert: fs.readFileSync("config/server.cert")
};

// Variables
const app = express();
const port = process.env.PORT;

// Middleware
app.use(logger("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
passport_verify(passport);

// Routes
api.get("/", (req: express.Request, res: express.Response) => res.send("The response from the server"));
app.use("/api", api);

// Listen on port
https.createServer(credentials, app).listen(443, () => console.log(">> HTTPS Server is running"));
app.listen(port, () => console.log(`>> HTTP Server is running on port ${port}`));