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

        // Detect if it's a code-related query
        const isCodeQuery = /code|program|algorithm|function|implementation/i.test(query);
        
        // Adjust max tokens and prompt based on query type
        const maxTokens = isCodeQuery ? 1000 : 500;
        const prompt = isCodeQuery
            ? `Question: ${query}\nProvide a clear, well-commented implementation. Include explanations where necessary.\nAnswer:\n`
            : `Question: ${query}\nAnswer: `;

        console.log("Making API request to Together AI...");
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
                temperature: isCodeQuery ? 0.3 : 0.7, // Lower temperature for code
                top_k: 50,
                top_p: isCodeQuery ? 0.9 : 0.7, // Higher top_p for code
                repetition_penalty: 1.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
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
