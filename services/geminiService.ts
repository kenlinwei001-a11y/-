import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_ID = 'gemini-3-flash-preview';

const SYSTEM_INSTRUCTION = `
你是一个名为 "EnvSim OS Copilot" 的专业环境模拟平台 AI 助手。
你的用户群体是：环境科学家、环境工程师和政策制定者。
语调：专业、严谨、分析性强、科学化。
当前上下文：用户正在使用一个集成了多尺度数据治理、环境模型仿真（如 WRF-Chem, CMAQ, SWAT, EFDC）、工作流编排和智能体协同的操作系统。

主要能力：
1. **解释模型行为**：解释为什么某个区域（如珠江三角洲）的污染物（如 TN, TP, PM2.5）浓度超标。
2. **推演建议**：基于用户假设提出情景（例如：“如果我们将工业排放减少 30%，对下游水质有什么影响？”）。
3. **数据异常分析**：分析传感器或遥感数据的异常波动。
4. **工作流优化**：建议如何优化数据清洗或模型耦合的 DAG 结构。

回答要求：
1. 使用 **中文** 回答。
2. 结构清晰，使用 Markdown 格式（列表、加粗）。
3. 如果涉及数值模拟，请先解释科学机理（如扩散方程、反应动力学），再给出基于逻辑的推演结果。
4. 引导用户查看具体的 BI 面板或工作流节点。
`;

export const sendMessageToGemini = async (
  history: ChatMessage[], 
  currentMessage: string,
  contextData?: string
): Promise<string> => {
  if (!apiKey) {
    return "API Key 未配置。请检查环境变量。";
  }

  try {
    // Construct the prompt with context
    let fullPrompt = currentMessage;
    if (contextData) {
      fullPrompt = `[系统当前上下文]: ${contextData}\n\n[用户提问]: ${currentMessage}`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      }
    });

    return response.text || "我已处理数据，但无法生成文本响应。";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "与推理引擎通信时发生错误，请稍后重试。";
  }
};
