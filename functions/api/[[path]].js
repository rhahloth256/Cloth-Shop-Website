export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle the OAuth callback
  if (path.includes('/auth/callback')) {
    return handleOAuthCallback(context);
  }

  return new Response('Not Found', { status: 404 });
}

async function handleOAuthCallback({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  // Redirect back to admin with the code
  const redirectUrl = `https://hariecollection.pages.dev/admin/?code=${code}`;
  return Response.redirect(redirectUrl, 302);
}