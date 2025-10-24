export async function onRequestPost(context) {
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const username = "rhahloth256";
  const repo = "Cloth-Shop-Website";
  const path = "data/products.json";

  try {
    const { products } = await context.request.json();

    // 1) Get current file sha (if exists)
    let sha = undefined;
    const infoRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    if (infoRes.status === 200) {
      const info = await infoRes.json();
      sha = info.sha;
    } else if (infoRes.status !== 404) {
      // Unexpected error
      return new Response(JSON.stringify({ error: "Failed to read file info" }), { status: 502 });
    }

    // 2) Prepare content
    const contentJson = JSON.stringify({ products }, null, 2);
    const contentBase64 = btoa(contentJson);

    // 3) Commit update (PUT creates or updates)
    const putRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: `Update products via dashboard - ${new Date().toISOString()}`,
        content: contentBase64,
        ...(sha ? { sha } : {})  // include sha only if file existed
      })
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return new Response(JSON.stringify({ error: "GitHub update failed", details: t }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
