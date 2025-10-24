export async function onRequestPost(context) {
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const username = "rhahloth256";
  const repo = "Cloth-Shop-Website";
  const path = "data/products.json";

  try {
    const { products } = await context.request.json();
    const infoUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

    console.log("📡 Fetching file info:", infoUrl);

    // ⚙️ Create explicit Headers object (Cloudflare-safe)
    const headers = new Headers();
    headers.set("Authorization", `token ${GITHUB_TOKEN}`);
    headers.set("User-Agent", "hariecollection-cms"); // ✅ must be capitalized
    headers.set("Accept", "application/vnd.github.v3+json");

    // STEP 1: Fetch file info
    const infoRes = await fetch(infoUrl, { headers });
    console.log("ℹ️ infoRes.status:", infoRes.status);
    const infoBody = await infoRes.text();
    console.log("📦 infoRes body:", infoBody);

    let sha;
    if (infoRes.status === 200) {
      const info = JSON.parse(infoBody);
      sha = info.sha;
      console.log("✅ Existing file found. SHA:", sha);
    } else if (infoRes.status === 404) {
      console.log("ℹ️ File not found — will create a new one.");
    } else {
      return new Response(
        JSON.stringify({
          error: "Failed to read file info",
          details: infoBody,
        }),
        { status: infoRes.status }
      );
    }

    // STEP 2: Prepare content (UTF-8 safe)
    const contentJson = JSON.stringify({ products }, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(contentJson)));

    // STEP 3: Push update
    console.log("🚀 Pushing update to GitHub...");
    const putHeaders = new Headers();
    putHeaders.set("Authorization", `token ${GITHUB_TOKEN}`);
    putHeaders.set("User-Agent", "hariecollection-cms");
    putHeaders.set("Accept", "application/vnd.github.v3+json");
    putHeaders.set("Content-Type", "application/json");

    const putRes = await fetch(infoUrl, {
      method: "PUT",
      headers: putHeaders,
      body: JSON.stringify({
        message: `Update products via dashboard - ${new Date().toISOString()}`,
        content: contentBase64,
        ...(sha ? { sha } : {}),
      }),
    });

    console.log("📊 putRes.status:", putRes.status);
    const putBody = await putRes.text();
    console.log("🧾 putRes body:", putBody);

    if (!putRes.ok) {
      return new Response(
        JSON.stringify({
          error: "GitHub update failed",
          details: putBody,
        }),
        { status: 502 }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "✅ Products saved to GitHub!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("❌ Worker error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
