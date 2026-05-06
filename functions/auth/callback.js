export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return Response.redirect(`${url.origin}${next}`)
      } else if (forwardedHost) {
        return Response.redirect(`https://${forwardedHost}${next}`)
      } else {
        return Response.redirect(`${url.origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return Response.redirect(`${url.origin}/auth/auth-code-error`)
}

// Helper function to create Supabase client
function createClient(supabaseUrl, supabaseKey) {
  // This is a simplified version - in production you'd use the actual Supabase client
  return {
    auth: {
      exchangeCodeForSession: async (code) => {
        // Implement the actual OAuth exchange logic here
        // This would typically call Supabase's exchangeCodeForSession method
        return { error: null }
      }
    }
  }
}