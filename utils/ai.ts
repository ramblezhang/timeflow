
import { HistoryItem, LLMSettings } from '../types';

/**
 * Prepares the history data for the LLM prompt.
 * Filters for the last 14 days and formats specifically for analysis.
 */
export const prepareDataForPrompt = (history: HistoryItem[]): string => {
  const now = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(now.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  const filtered = history.filter(item => {
    // Robust date parsing
    if (!item.date) return false;
    const d = new Date(item.date.replace(/\//g, '-')); 
    return !isNaN(d.getTime()) && d >= twoWeeksAgo;
  });

  if (filtered.length === 0) return "No recent activity recorded.";

  // Group by category to give summary stats
  const stats: Record<string, number> = {};
  filtered.forEach(item => {
    const duration = getDurationInMinutes(item.startTime, item.endTime);
    stats[item.name] = (stats[item.name] || 0) + duration;
  });

  let dataStr = "Summary of last 14 days:\n";
  Object.entries(stats).forEach(([name, minutes]) => {
     const hours = (minutes / 60).toFixed(1);
     dataStr += `- ${name}: ${hours} hours\n`;
  });

  dataStr += "\nDetailed Logs (Date | Task | Duration | Note):\n";
  filtered.slice(0, 50).forEach(item => { // Limit to last 50 entries to save tokens
    const duration = getDurationInMinutes(item.startTime, item.endTime);
    dataStr += `${item.date} | ${item.name} | ${duration}m | ${item.note || ''}\n`;
  });

  return dataStr;
};

const getDurationInMinutes = (start: string, end: string): number => {
    if (!start || !end) return 0;
    try {
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
        
        let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (mins < 0) mins += 24 * 60;
        return mins;
    } catch(e) {
        return 0;
    }
};

export const fetchLumiereInsight = async (dataContext: string, settings: LLMSettings): Promise<string> => {
    if (!settings.apiKey) {
        throw new Error("API Key is missing. Please configure it in settings.");
    }

    let apiKey = settings.apiKey;
    try {
        const decoded = atob(settings.apiKey);
        // Try UTF-8 decode
        try {
            const bytes = new Uint8Array(decoded.length);
            for (let i = 0; i < decoded.length; i++) {
                bytes[i] = decoded.charCodeAt(i);
            }
            apiKey = new TextDecoder("utf-8").decode(bytes);
        } catch {
             apiKey = decoded; // Fallback to raw binary string (works for ASCII)
        }
    } catch (e) {
        // Fallback: if user manually pasted a non-base64 key in local storage or some edge case
        apiKey = settings.apiKey;
    }

    // Sanitize API Key (remove spaces/newlines)
    apiKey = apiKey.trim();

    // Ensure clean URL
    const baseUrl = (settings.baseUrl || '').replace(/\/$/, '').trim();
    if (!baseUrl) throw new Error("API Base URL is missing.");
    
    const url = `${baseUrl}/chat/completions`;

    const SYSTEM_PROMPT = `
你是一位深邃的时间哲学家与生活观察家。你的名字叫“流光”。
你的任务是阅读用户过去两周的时间记录，分析其生活重心、平衡感与潜在的焦虑或心流时刻。

请不要输出枯燥的数据报表。
请用**富有艺术感、散文诗般**的语言，以“第二人称”与用户对话。
风格要求：温柔、深刻、治愈，带有轻微的文学性，如同给老友写信。

结构建议（不需要严格遵守，保持自然流淌）：
1. **韵律**: 描述这十四天里时间的流速。
2. **聚光**: 你的时间都在哪儿闪光？
3. **留白**: 缺少了什么？
4. **回响**: 给出一句富有哲理的指引或鼓励。

请使用 Markdown 格式，适当使用加粗。不要使用 Markdown 标题（#）。
字数控制在 300-500 字之间。
    `.trim();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: settings.modelName || 'Qwen/Qwen3-235B-A22B-Thinking-2507', // Updated Fallback
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: dataContext || "No activity." }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: false 
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP Error ${response.status}`;
            
            // Log full error for debugging
            console.error("AI API Error Response:", errorText);

            try {
                const json = JSON.parse(errorText);
                if (json.error && json.error.message) {
                    errorMessage = json.error.message;
                } else if (json.message) {
                    errorMessage = json.message;
                }
            } catch {
                if (errorText && errorText.length < 300) {
                    errorMessage = errorText;
                }
            }

            // Provide specific help for 400 Bad Request
            if (response.status === 400) {
                errorMessage = `请求被拒绝 (400)：请检查“模型名称”是否正确（当前：${settings.modelName || '默认'}），或 API Key 是否有效。错误信息: ${errorMessage}`;
            }

            throw new Error(errorMessage);
        }

        const json = await response.json();
        
        // Validate response structure
        if (!json.choices || json.choices.length === 0 || !json.choices[0].message) {
            throw new Error("Invalid response format from AI provider.");
        }

        return json.choices[0].message.content || "流光静默，未有回响。";

    } catch (error: any) {
        console.error("AI Request Failed Details:", error);
        
        // Handle common fetch errors (Network/CORS)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error("网络请求失败：可能是跨域限制(CORS)或网络断开。请检查 API URL 是否允许浏览器直接访问。");
        }
        
        throw error;
    }
};
