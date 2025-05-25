import express from "express";
import "express-async-errors";
import financeRoutes from "./routes/financeRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";
// import { DatabaseService } from "./services/databaseService";
import { config } from "./config/env";

const app = express();
app.use(express.json());

// const dbService = new DatabaseService();

async function startServer() {
  try {
    // await dbService.connect();
    app.use("/api/health", (_req, res) => {
      res.json("Application - Personal AI Finance Assistant is up and running");
    });
    app.use("/api", financeRoutes);
    app.use(errorMiddleware);
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
