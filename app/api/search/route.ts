import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Check if API key is set
        if (!process.env.TOGETHER_API_KEY) {
            console.error("Together AI API key is not set");
            return new Response(JSON.stringify({ error: "API key configuration error" }), { status: 500 });
        }

        const { query } = await req.json();
        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
        }

        // Normalize the query to handle different phrasings
        const normalizedQuery = query.toLowerCase().trim();
        
        // More comprehensive code-related query detection
        const isCodeQuery = /code|program|algorithm|function|implementation|problem|solution|write|give|provide/i.test(normalizedQuery) && 
                          /(c\+\+|java|python|javascript|typescript|ruby|php|golang|c#)/i.test(normalizedQuery);
        
        // Adjust max tokens and prompt based on query type
        const maxTokens = isCodeQuery ? 1500 : 500;
        
        // Enhanced prompt template
        let prompt;
        if (isCodeQuery) {
            // Extract the programming language from the query
            const langMatch = normalizedQuery.match(/(c\+\+|java|python|javascript|typescript|ruby|php|golang|c#)/i);
            const language = langMatch ? langMatch[0].toUpperCase() : 'code';
            prompt = `Question: ${query}\nProvide a complete, well-commented ${language} implementation. Include explanations for key concepts.\nAnswer:\n`;
        } else {
            prompt = `Question: ${query}\nAnswer: `;
        }

        console.log("Making API request to Together AI...", { isCodeQuery, maxTokens });
        const response = await fetch('https://api.together.xyz/inference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
                prompt: prompt,
                max_tokens: maxTokens,
                temperature: isCodeQuery ? 0.2 : 0.7, // Even lower temperature for code
                top_k: isCodeQuery ? 40 : 50,
                top_p: isCodeQuery ? 0.95 : 0.7, // Higher top_p for code
                repetition_penalty: isCodeQuery ? 1.05 : 1.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
            console.error("Together AI error response:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            return new Response(JSON.stringify({ 
                error: "AI service error",
                details: errorData
            }), { status: response.status });
        }

        const data = await response.json();
        if (!data.output?.choices?.[0]?.text) {
            console.error("Invalid response format:", data);
            return new Response(JSON.stringify({ 
                error: "Invalid response format from AI service"
            }), { status: 500 });
        }

        console.log("Successfully received response from Together AI");
        return NextResponse.json({ response: data.output.choices[0].text.trim() });
    } catch (error) {
        console.error("Search API error:", error);
        return new Response(JSON.stringify({ 
            error: "Server error",
            details: error instanceof Error ? error.message : String(error)
        }), { status: 500 });
    }
}
