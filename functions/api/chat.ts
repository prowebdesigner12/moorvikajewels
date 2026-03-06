export const onRequestPost: PagesFunction = async ({ request }) => {
    try {
        const { messages, textToSend, systemPrompt } = await request.json() as any;
        const API_KEY = "AIzaSyCET7b5jpD_wl95pl7hvMLlfRfXYTiVKdI";

        // Use verified models based on API key scan
        const models = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-pro-latest"
        ];
        const endpoints = ["v1", "v1beta"];

        let aiResponseText = "";
        let lastError = "";

        for (const endpoint of endpoints) {
            for (const modelName of models) {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/${endpoint}/models/${modelName}:generateContent?key=${API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                ...messages.filter((m: any) => m.id !== '1').map((m: any) => ({
                                    role: m.role === 'user' ? 'user' : 'model',
                                    parts: [{ text: m.text }]
                                })),
                                { role: "user", parts: [{ text: `${systemPrompt}\n\nQuestion: ${textToSend}` }] }
                            ],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json() as any;
                        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                            aiResponseText = data.candidates[0].content.parts[0].text;
                            if (aiResponseText) break;
                        }
                    } else {
                        const err = await response.json().catch(() => ({})) as any;
                        lastError = err.error?.message || `Status ${response.status} on ${endpoint}/${modelName}`;
                    }
                } catch (e: any) {
                    lastError = e.message;
                }
            }
            if (aiResponseText) break;
        }

        if (!aiResponseText) throw new Error(lastError || "AI Failed to respond (All models failed)");

        return new Response(JSON.stringify({ text: aiResponseText }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
