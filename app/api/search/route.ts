import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
        }

        // Improved prompt template
        const prompt = `You are a helpful AI assistant with expertise in programming, technology, and general knowledge. 
Please provide a clear, direct, and accurate answer to the following question. 
If the question is about code or technical topics, include relevant code examples or step-by-step instructions.

Question: ${query}

Answer: `;

        const response = await fetch('https://api.together.xyz/inference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
                prompt: prompt,
                max_tokens: 800,
                temperature: 0.7,
                top_k: 50,
                top_p: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Together AI error:", errorData);
            return new Response(JSON.stringify({ error: "AI service error" }), { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ response: data.output.choices[0].text.trim() });
    } catch (error) {
        console.error("Search API error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
