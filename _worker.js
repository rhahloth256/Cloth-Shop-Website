export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- API endpoint ---
    if (url.pathname === "/save-products" && request.method === "POST") {
      try {
        const GITHUB_TOKEN = env.GITHUB_TOKEN;
        const username = "rhahloth256";
        const repo = "Cloth-Shop-Website";
        const path = "data/products.json";

        const { products } = await request.json();

        // 1️⃣ Get SHA if file exists
        let sha;
        const infoRes = await fetch(
          `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
          { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
        );

        if (infoRes.status === 200) {
          const info = await infoRes.json();
          sha = info.sha;
        } else if (infoRes.status !== 404) {
          return new Response(
            JSON.stringify({ error: "Failed to read file info" }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        // 2️⃣ Encode new content
        const contentBase64 = btoa(JSON.stringify({ products }, null, 2));

        // 3️⃣ Push update to GitHub
        const putRes = await fetch(
          `https://api.github.com/repos/${username}/${repo}/contents/${path}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Update products via dashboard - ${new Date().toISOString()}`,
              content: contentBase64,
              ...(sha ? { sha } : {}),
            }),
          }
        );

        if (!putRes.ok) {
          const text = await putRes.text();
          return new Response(
            JSON.stringify({ error: "GitHub update failed", details: text }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // --- otherwise serve your static site ---
    return env.ASSETS.fetch(request);
  },
};
