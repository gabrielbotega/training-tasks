import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import feedRoutes from "./routes/feed.js";
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/feed", feedRoutes);
app.use((req, res) => {
    res.status(404).json({
        message: "route not found",
    });
});
app.listen(3000);
//# sourceMappingURL=index.js.map