export async function onRequestPost(context) {
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const username = "rhahloth256";
  const repo = "Cloth-Shop-Website";
  const path = "data/products.json";

  try {
    const { products } = await context.request.json();
    const infoUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

    console.log("📡 Fetching file info:", infoUrl);

    // STEP 1: Try to get the current file's SHA (needed for updates)
    const infoRes = await fetch(infoUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "hariecollection-cms",
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log("ℹ️ infoRes.status:", infoRes.status);
    const infoBody = await infoRes.text();
    console.log("📦 infoRes body:", infoBody);

    let sha;
    if (infoRes.status === 200) {
      const info = JSON.parse(infoBody);
      sha = info.sha;
    } else if (infoRes.status === 404) {
      console.log("ℹ️ File not found, will create a new one.");
    } else if (infoRes.status === 403) {
      return new Response(
        JSON.stringify({
          error: "GitHub access forbidden. Check token scope or User-Agent.",
        }),
        { status: 403 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to read file info", infoBody }),
        { status: infoRes.status }
      );
    }

    // STEP 2: Prepare new file content
    const contentJson = JSON.stringify({ products }, null, 2);
    const contentBase64 = btoa(contentJson);

    // STEP 3: Push updated file to GitHub
    console.log("🚀 Pushing update to GitHub...");
    const putRes = await fetch(infoUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "hariecollection-cms", // 👈 required again
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Update products via dashboard - ${new Date().toISOString()}`,
        content: contentBase64,
        ...(sha ? { sha } : {}), // include SHA if file existed
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

    // STEP 4: Respond success
    return new Response(
      JSON.stringify({ ok: true, message: "✅ Products saved to GitHub!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.log("❌ Worker error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
