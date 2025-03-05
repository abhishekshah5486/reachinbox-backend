const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);

module.exports = { geminiClient };