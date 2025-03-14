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
        // Debug: Log environment check
        console.log("Checking environment variables...");
        console.log("TOGETHER_AI_API_KEY exists:", !!process.env.TOGETHER_AI_API_KEY);
        
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

        // Debug: Log request parsing
        console.log("Parsing request body...");
        const body = await req.json();
        console.log("Request body:", { query: body.query });

        if (!body.query?.trim()) {
            return new Response(JSON.stringify({ 
                error: "Invalid request", 
                message: "Query is required" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Debug: Log API request preparation
        const prompt = `Question: ${body.query}\nAnswer: `;
        console.log("Prepared prompt:", prompt);

        // Together AI API endpoint
        const API_URL = 'https://api.together.xyz/inference';
        
        // Debug: Log API request details
        const requestBody = {
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            prompt: prompt,
            max_tokens: 500,  // Reduced from 800 for faster responses
            temperature: 0.7,
            top_k: 50,
            top_p: 0.7,
            repetition_penalty: 1.1
        };
        
        console.log("Making API request to:", API_URL);
        console.log("Request configuration:", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.substring(0, 4)}...` // Log first 4 chars only
            },
            requestBody
        });

        // Use fetchWithRetry instead of fetchWithTimeout
        const response = await fetchWithRetry(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        }, 3); // 3 retries

        // Debug: Log response details
        console.log("API Response received:", {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Details:", {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                errorText
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

        // Debug: Log response parsing
        console.log("Parsing API response...");
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log("Parsed response data:", data);
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

        // Debug: Log response validation
        console.log("Validating response structure...");
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

        // Debug: Log successful response
        console.log("Successfully processed response");
        return new Response(JSON.stringify({ 
            response: data.output.choices[0].text.trim()
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // Debug: Log any unexpected errors
        console.error("Unexpected error:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return new Response(JSON.stringify({ 
            error: "Server error",
            message: error.message || "An unexpected error occurred"
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
