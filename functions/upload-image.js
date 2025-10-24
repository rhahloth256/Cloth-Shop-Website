export async function onRequestPost(context) {
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const username = "rhahloth256";
  const repo = "Cloth-Shop-Website";

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");
    if (!file || !file.name) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const filePath = `assets/img/uploads/${file.name}`;

    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "CloudflareWorker",
      },
      body: JSON.stringify({
        message: `Upload product image: ${file.name}`,
        content: base64,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "GitHub upload failed", details: err }), { status: 502 });
    }

    // Return the public GitHub Pages path
    const publicUrl = `/assets/img/uploads/${file.name}`;
    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
