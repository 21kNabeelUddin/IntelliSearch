import { NextResponse } from 'next/server';

// Utility function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
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
        // API key validation with correct environment variable name
        const apiKey = process.env.TOGETHER_AI_API_KEY;
        if (!apiKey?.trim()) {
            console.error("API key missing or empty");
            return new Response(JSON.stringify({ 
                error: "Configuration error", 
                message: "API key not configured (TOGETHER_AI_API_KEY)" 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Request body validation
        let query;
        try {
            const body = await req.json();
            query = body.query;
        } catch (error) {
            console.error("Failed to parse request body:", error);
            return new Response(JSON.stringify({ 
                error: "Invalid request", 
                message: "Invalid JSON in request body" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!query?.trim()) {
            return new Response(JSON.stringify({ 
                error: "Invalid request", 
                message: "Query is required" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Log the API key length (safely)
        console.log("API Key length:", apiKey.length);
        console.log("First 4 chars of API key:", apiKey.substring(0, 4));

        // Prepare request
        const prompt = `Question: ${query}\nAnswer: `;
        
        // API endpoint
        const API_URL = 'https://api.together.xyz/inference';
        
        console.log("Making API request...", {
            url: API_URL,
            model: "meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
            queryLength: query.length
        });

        const response = await fetch(API_URL, {
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
        });

        // Log full response details
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Details:", {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText
            });
            
            return new Response(JSON.stringify({ 
                error: "AI service error",
                message: `API returned status ${response.status}`,
                details: errorText
            }), { 
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse response
        let data;
        try {
            const responseText = await response.text();
            console.log("Raw API Response:", responseText);
            data = JSON.parse(responseText);
        } catch (error) {
            console.error("Failed to parse API response:", error);
            return new Response(JSON.stringify({ 
                error: "Invalid response", 
                message: "Failed to parse API response"
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate response structure
        if (!data?.output?.choices?.[0]?.text) {
            console.error("Invalid response structure:", data);
            return new Response(JSON.stringify({ 
                error: "Invalid response", 
                message: "Unexpected response format from AI service"
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Return successful response
        return new Response(JSON.stringify({ 
            response: data.output.choices[0].text.trim()
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response(JSON.stringify({ 
            error: "Server error",
            message: error.message || "An unexpected error occurred"
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
