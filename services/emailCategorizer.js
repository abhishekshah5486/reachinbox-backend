const { geminiClient } = require("../config/geminiConfig");

const systemPromptToGenerateLabel = (emailDetails) => {
    const prompt = `

    You are an advanced AI email assistant. Your task is to analyze the given email and categorize it into one of the following categories based on its intent and content:

    Interested: The sender expresses clear interest in the offer, product, or service.
    Meeting Booked: The sender has scheduled or confirmed a meeting.
    Not Interested: The sender explicitly declines or shows disinterest.
    Spam: The email contains unsolicited content, promotional material, or irrelevant information.
    Out of Office: The sender is currently unavailable, as indicated by an automatic response.

    Email Content:
    Subject: ${emailDetails.subject}
    Date: ${emailDetails.date}
    Text: ${emailDetails.text}
    HTML: ${emailDetails.html}    

    Carefully evaluate the intent and sentiment of the email. Respond with only the most appropriate category name.

    `;  
    return prompt;
};


const categorizeEmail = async (email) => {
    try {
        const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-pro" });
        const promptToCategorize = systemPromptToGenerateLabel(email);
        const response = await model.generateContent(promptToCategorize);
        const category = response.response.candidates[0].content.parts[0].text.trim();
        return category;

    } catch (error) {
        console.log("", error.message);
    }
}

module.exports = { categorizeEmail };