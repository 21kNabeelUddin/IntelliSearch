export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
        const response = await fetch(`${backendUrl}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            return new Response(JSON.stringify({ error: "Backend server error" }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Search API error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
