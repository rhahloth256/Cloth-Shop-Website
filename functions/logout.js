export async function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie":
        "adminAuth=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      Location: "/login",
    },
  });
}
