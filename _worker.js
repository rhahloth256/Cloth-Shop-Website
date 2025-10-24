export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // DEBUG route to verify env vars
    if (url.pathname === "/env-check") {
      return new Response(
        JSON.stringify({
          hasToken: !!env.GITHUB_TOKEN,
          tokenStart: env.GITHUB_TOKEN
            ? env.GITHUB_TOKEN.slice(0, 8) + "..."
            : null,
          hasUsername: !!env.GITHUB_USERNAME,
          username: env.GITHUB_USERNAME || null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // -------------------------------
    //   MAIN SAVE-PRODUCTS HANDLER
    // -------------------------------
    if (url.pathname === "/save-products" && request.method === "POST") {
      try {
        const GITHUB_TOKEN = env.GITHUB_TOKEN;
        const username = "rhahloth256";
        const repo = "Cloth-Shop-Website";
        const path = "data/products.json";

        if (!GITHUB_TOKEN) {
          console.error("❌ No GitHub token found in environment.");
          return new Response(
            JSON.stringify({ error: "Missing GITHUB_TOKEN env variable" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        const { products } = await request.json();

        // STEP 1: try to read file info
        const infoUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
        console.log("📡 Fetching file info:", infoUrl);

        const infoRes = await fetch(infoUrl, {
          headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });

        console.log("ℹ️ infoRes.status:", infoRes.status);
        const infoText = await infoRes.text();
        console.log("📦 infoRes body:", infoText);

        let sha;
        if (infoRes.status === 200) {
          const info = JSON.parse(infoText);
          sha = info.sha;
        } else if (infoRes.status !== 404) {
          return new Response(
            JSON.stringify({
              error: "Failed to read file info",
              status: infoRes.status,
              body: infoText,
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        // STEP 2: prepare content
        const contentBase64 = btoa(JSON.stringify({ products }, null, 2));

        // STEP 3: push update
        console.log("🚀 Pushing update to GitHub...");
        const putRes = await fetch(infoUrl, {
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
        });

        console.log("📊 putRes.status:", putRes.status);
        const putText = await putRes.text();
        console.log("🧾 putRes body:", putText);

        if (!putRes.ok) {
          return new Response(
            JSON.stringify({
              error: "GitHub update failed",
              status: putRes.status,
              details: putText,
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("💥 Worker error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // fallback: serve static site
    return env.ASSETS.fetch(request);
  },
};
