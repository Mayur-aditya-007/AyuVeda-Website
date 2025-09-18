// chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemInstruction = `You are a helpful assistant and an expert on Ayurveda. Provide answers to user questions, always staying within the context of Ayurvedic principles and knowledge. Use clear, simple language to explain concepts.`;

// Function to handle chat requests
const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // Build a "conversation" with system instruction included as first role
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }], // add system prompt as first input
        },
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
      },
    });

    // Send user’s actual message
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to get a response from the AI.", details: error.message });
  }
};

module.exports = { handleChat };
