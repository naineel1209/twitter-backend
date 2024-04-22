import { config } from "dotenv";
import express from "express";
import { createServer } from "http";
import logger from "./config/winston.config";
import morgan from "morgan";
import indexRoutes from "./index.routes";
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev", {
    stream: {
        write: (message) => logger.info(message.trim())

    }
}));

app.get("/", (req, res) => {
    return res.send("Hello World");
});

app.use("/api/v1", indexRoutes);

const server = createServer(app);
server.listen(Number(PORT), () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
})