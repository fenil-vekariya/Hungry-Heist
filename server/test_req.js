async function run() {
    try {
        const response = await fetch("http://localhost:5000/api/category/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "DiagnosticTest" })
        });
        const text = await response.text();
        console.log("STATUS:", response.status);
        console.log("RESPONSE BODY:", text.substring(0, 300));
    } catch (err) {
        console.log("NETWORK ERROR:", err.message);
    }
}
run();
