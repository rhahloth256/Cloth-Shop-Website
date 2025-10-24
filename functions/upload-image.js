export async function onRequestPost(context) {
  // ✅ Check auth cookie
  const cookie = context.request.headers.get("Cookie") || "";
  if (!cookie.includes("adminAuth=true")) {
    return new Response("Unauthorized", { status: 403 });
  }

  const GITHUB_TOKEN = context.env.GITHUB_TOKEN;
  const username = "rhahloth256";
  const repo = "Cloth-Shop-Website";
  const branch = "main";

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file || !file.name) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Convert file to Base64 safely (no Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    function toBase64(bytes) {
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    }

    const base64 = toBase64(bytes);

    // ✅ Safe unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `assets/img/uploads/${timestamp}_${safeName}`;

    // ✅ GitHub API upload
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
    const uploadRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "CloudflareWorker",
      },
      body: JSON.stringify({
        message: `Upload product image: ${file.name}`,
        content: base64,
        branch,
      }),
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("GitHub upload failed:", data);
      return new Response(JSON.stringify({ error: data.message || "GitHub upload failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Return a raw GitHub CDN link
    const publicUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${filePath}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Upload error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
