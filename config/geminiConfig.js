const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({path: path.resolve(__dirname, "../.env")});

const GOOGLE_GEMINI_APIKEY = process.env.GEMINI_API_KEY;

const geminiClient = new GoogleGenerativeAI(GOOGLE_GEMINI_APIKEY);

module.exports = { geminiClient };