const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const generateQuestions = async (role) => {
  try {
    const prompt = `Generate 3 technical interview questions for the role of a ${role}. 
      Each question should be clear and relevant to assess a candidate’s practical understanding.`;

    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const questions = text
      .split("\n")
      .filter((line) => line.trim())
      .map((q) => q.replace(/^\d+\.\s*/, "").trim());

    console.log("📩 Questions from Gemini:", questions);
    return questions;
  } catch (error) {
    console.error("❌ Gemini generateQuestions error:", error);
    return [];
  }
};

export async function evaluateAnswers(pairs, role) {
    if (!Array.isArray(pairs)) {
      console.error("❌ Gemini: evaluateAnswers received invalid pairs:", pairs);
      return "Invalid data for evaluation.";
    }
  
    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  
    const prompt = `Evaluate the following answers for a ${role} interview. Provide feedback and a score out of 10 for each.
  
  ${pairs.map((pair, i) => `Q${i + 1}: ${pair.question}\nA${i + 1}: ${pair.answer}`).join('\n\n')}
  
  Give your response in a clear paragraph format.`;
  
    try {
      const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
  
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No evaluation returned.";
    } catch (error) {
      console.error("❌ Gemini evaluateAnswers error:", error);
      return "Evaluation failed.";
    }
  }
      
