import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Krish AI, an expert Senior Frontend Engineer and UI/UX Designer.
Your task is to generate complete, single-file HTML applications based on user prompts.

RULES:
1.  **Single File:** Output a SINGLE HTML file that contains everything (HTML, CSS, JS).
2.  **Tech Stack:** Use React (via CDN), ReactDOM (via CDN), and Tailwind CSS (via CDN).
3.  **Babel:** Use Babel Standalone to compile JSX in the browser.
4.  **Structure:**
    *   Start with standard HTML5 boilerplate.
    *   Include Tailwind script: <script src="https://cdn.tailwindcss.com"></script>
    *   Include React/ReactDOM/Babel scripts.
    *   Define a root div: <div id="root"></div>
    *   Write the React code inside <script type="text/babel">.
    *   Mount the app to the root div.
5.  **Quality:** The app must look modern, professional, and "Lovable" style (clean, rounded corners, nice shadows, good typography).
6.  **Icons:** Use "lucide-react" or SVG icons if needed (CDN or inline SVGs preferred). If using lucide, use the global variable if available or just inline SVGs for reliability. **Strong preference for Inline SVGs** to avoid dependency issues.
7.  **Images:** Use https://picsum.photos/width/height for placeholders.
8.  **Responsiveness:** The app MUST be fully responsive.
9.  **Interactivity:** The app MUST be functional (e.g., if a Todo app, buttons should work using React state).
10. **Modification:** If the user asks to change something, you will receive the previous code. Modify it to meet the new requirement while keeping existing functionality.
11. **Vision/Images:** If the user provides an image, analyze the layout, colors, and structure and replicate it as closely as possible in React/Tailwind.

OUTPUT FORMAT:
Return a JSON object with the following schema:
{
  "explanation": "A brief, friendly explanation of what you built or changed.",
  "html": "<!DOCTYPE html>..."
}
Make sure the JSON is valid. Escape quotes properly in the HTML string.
`;

export const generateAppCode = async (
  prompt: string,
  currentCode: string | null,
  imageBase64?: string
): Promise<{ html: string; explanation: string }> => {
  try {
    const parts: any[] = [];
    
    // Add Image if present (Vision to Code)
    if (imageBase64) {
      // Remove data URL prefix if present to get raw base64
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG or JPEG, GenAI handles standard types
          data: base64Data
        }
      });
      parts.push({ text: "Build a web app that looks exactly like this image. " + prompt });
    } else {
      const fullPrompt = currentCode
      ? `Original Code:\n${currentCode}\n\nUser Request: ${prompt}\n\nUpdate the code to match the request. Keep it a single HTML file.`
      : `Create a new web app: ${prompt}`;
      parts.push({ text: fullPrompt });
    }

    const response = await ai.models.generateContent({
      model: imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-3-pro-preview', // Use Vision model if image present
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    return {
      html: parsed.html,
      explanation: parsed.explanation || "Here is your generated app.",
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate app. Please try again.");
  }
};