export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}
