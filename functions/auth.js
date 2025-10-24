export async function onRequest(context) {
  const password = context.env.ADMIN_PASSWORD;
  const url = new URL(context.request.url);

  // Serve the login form if not authorized
  const cookie = context.request.headers.get("Cookie") || "";
  if (!cookie.includes("adminAuth=true")) {
    if (url.pathname === "/login" && context.request.method === "POST") {
      const formData = await context.request.formData();
      const entered = formData.get("password");
      if (entered === password) {
        return new Response("Logged in", {
          status: 302,
          headers: {
            "Set-Cookie": "adminAuth=true; Path=/; HttpOnly; Secure; SameSite=Strict",
            "Location": "/admin",
          },
        });
      } else {
        return new Response("Incorrect password", { status: 401 });
      }
    }

    return new Response(`
      <form method="POST" action="/login" style="text-align:center;margin-top:100px;">
        <h2>🔒 Admin Login</h2>
        <input name="password" type="password" placeholder="Enter password" style="padding:10px;" required />
        <button type="submit" style="padding:10px;">Login</button>
      </form>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Already logged in → continue to /admin
  return context.next();
}
