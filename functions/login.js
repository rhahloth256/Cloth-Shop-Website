export async function onRequestGet() {
  return new Response(
    `
    <html>
      <head>
        <title>HaRié Admin Login</title>
        <style>
          body { font-family: Inter, sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; background:#f7f7f7; }
          form { background:white; padding:2rem; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
          input { padding:10px; width:100%; margin-top:10px; border-radius:6px; border:1px solid #ccc; }
          button { margin-top:10px; padding:10px; width:100%; background:#000; color:white; border:none; border-radius:6px; cursor:pointer; }
        </style>
      </head>
      <body>
        <form method="POST" action="/login">
          <h3>Admin Login</h3>
          <input name="password" type="password" placeholder="Enter password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const entered = formData.get("password");

  if (entered === env.ADMIN_PASSWORD) {
    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie":
          "adminAuth=true; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400",
        Location: "/admin",
      },
    });
  }

  return new Response(
    `<html><body style="text-align:center;margin-top:100px;">
       <h3>Incorrect password</h3>
       <a href="/login">Try again</a>
     </body></html>`,
    { headers: { "Content-Type": "text/html" }, status: 401 }
  );
}
