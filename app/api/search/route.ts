import { NextResponse } from 'next/server';

// Utility function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

// Retry mechanism with exponential backoff
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, options);
            if (response.ok) return response;
            
            // If rate limited, wait and retry
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('retry-after') || String(Math.pow(2, attempt)));
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            
            // For other errors, throw immediately
            throw new Error(`API responded with status ${response.status}`);
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    throw new Error('Max retries exceeded');
};

// Validate API response structure
const validateAPIResponse = (data: any) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid response format');
    if (!data.output?.choices?.[0]?.text) throw new Error('Missing response text');
    return data.output.choices[0].text.trim();
};

export async function POST(req: Request) {
    try {
        // API key validation
        const apiKey = process.env.TOGETHER_API_KEY;
        if (!apiKey?.trim()) {
            console.error("Together AI API key is not set");
            return new Response(JSON.stringify({ 
                error: "Configuration error", 
                message: "API key not configured" 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Request body validation
        const { query } = await req.json().catch(() => ({}));
        if (!query?.trim()) {
            return new Response(JSON.stringify({ 
                error: "Invalid request", 
                message: "Query is required" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prepare request
        const prompt = `Question: ${query}\nAnswer: `;
        console.log("Making API request to Together AI...", { queryLength: query.length });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
                prompt: prompt,
                max_tokens: 800,
                temperature: 0.7,
                top_k: 50,
                top_p: 0.7,
                repetition_penalty: 1.1
            })
        };

        // Make API request with retry mechanism
        const response = await fetchWithRetry('https://api.together.xyz/inference', requestOptions);
        
        // Parse and validate response
        const rawData = await response.text();
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (error) {
            console.error("Failed to parse API response:", rawData);
            return new Response(JSON.stringify({ 
                error: "Invalid response", 
                message: "Failed to parse API response" 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate and return response
        const validatedResponse = validateAPIResponse(data);
        console.log("Successfully received and validated response");
        
        return new Response(JSON.stringify({ 
            response: validatedResponse 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Search API error:", error);
        
        // Categorize errors
        if (error.name === 'AbortError') {
            return new Response(JSON.stringify({ 
                error: "Timeout", 
                message: "Request timed out" 
            }), { 
                status: 504,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (error.message?.includes('Max retries exceeded')) {
            return new Response(JSON.stringify({ 
                error: "Service unavailable", 
                message: "Failed after multiple attempts" 
            }), { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            error: "Server error",
            message: error.message || "An unexpected error occurred"
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
