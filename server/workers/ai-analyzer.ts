import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  title: string;
  summary: string;
  category: string;
  tags: string[];
}

export async function analyzeWithAI(
  text: string,
  originalFilename: string,
  provider: "gemini" | "claude" | "openai" = "gemini"
): Promise<AnalysisResult> {
  const prompt = `Analyze the following file content and provide a structured analysis.

Filename: ${originalFilename}

Content:
${text.slice(0, 10000)}

Please provide your response in this exact JSON format:
{
  "title": "A clear, descriptive title for this content",
  "summary": "A 2-3 sentence summary of what this content is about",
  "category": "One category from: Code, Documentation, Data, Image, Document, Spreadsheet, Presentation, Archive, Other",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    if (provider === "claude" && process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      const response = await genai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt
      });
      const responseText = response.text || "";
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error("AI analysis error:", error);
  }

  // Fallback analysis
  return {
    title: originalFilename,
    summary: `Uploaded file: ${originalFilename}. ${text.slice(0, 200)}...`,
    category: inferCategory(originalFilename),
    tags: [path.extname(originalFilename).replace(".", "")],
  };
}

function inferCategory(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const codeExts = [".js", ".ts", ".py", ".java", ".cpp", ".c", ".go", ".rs", ".rb"];
  const docExts = [".txt", ".md", ".pdf", ".doc", ".docx"];
  const dataExts = [".json", ".csv", ".xml", ".yaml", ".yml"];
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];

  if (codeExts.includes(ext)) return "Code";
  if (docExts.includes(ext)) return "Documentation";
  if (dataExts.includes(ext)) return "Data";
  if (imageExts.includes(ext)) return "Image";
  if (ext === ".zip" || ext === ".tar" || ext === ".gz") return "Archive";
  
  return "Other";
}
