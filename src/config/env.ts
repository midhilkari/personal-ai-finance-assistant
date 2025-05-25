import dotenv from "dotenv";

dotenv.config();

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  kiteApiKey: process.env.KITE_API_KEY || "",
  kiteApiSecret: process.env.KITE_API_SECRET || "",
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/finance_assistant",
  port: parseInt(process.env.PORT || "3000", 10),
  travilyApiSecret: process.env.TAVILY_API_KEY || "",
};
