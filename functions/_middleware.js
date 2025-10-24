export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const cookie = request.headers.get("Cookie") || "";

  // Protect admin and save-products
  const protectedPaths = ["/admin", "/save-products"];
  const requiresAuth = protectedPaths.some((p) => path.startsWith(p));

  // Not protected? Continue
  if (!requiresAuth) return next();

  // If logged in, continue
  if (cookie.includes("adminAuth=true")) return next();

  // Otherwise redirect to /login
  return Response.redirect("https://hariecollection.pages.dev/login", 302);
}
