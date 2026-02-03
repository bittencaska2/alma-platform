import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any) {
                    cookiesToSet.forEach(({ name, value, options }: any) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protected routes - require authentication
    const protectedPaths = ['/patient', '/psychologist', '/admin']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Role-based access control
    if (user) {
        const userType = user.user_metadata?.user_type || 'patient'

        // Prevent unauthorized access to role-specific areas
        if (pathname.startsWith('/admin') && userType !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = userType === 'psychologist' ? '/psychologist/dashboard' : '/patient/dashboard'
            return NextResponse.redirect(url)
        }

        if (pathname.startsWith('/psychologist') && userType !== 'psychologist') {
            // Allow admin to view psychologist pages if needed, OR redirect to admin dashboard
            // For now, let's keep strict separation unless user is admin viewing frontend as user (future feature)
            // But strict requirement: Admins login to ADMIN view.
            if (userType === 'admin') {
                // Admin trying to access /psychologist -> Redirect to /admin usually, 
                // UNLESS we want admin to see it. 
                // Let's redirect Admin to /admin/dashboard to be safe and clear.
                const url = request.nextUrl.clone()
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }

            const url = request.nextUrl.clone()
            url.pathname = '/patient/dashboard' // Default fallback
            return NextResponse.redirect(url)
        }

        if (pathname.startsWith('/patient') && userType !== 'patient') {
            if (userType === 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
            const url = request.nextUrl.clone()
            url.pathname = '/psychologist/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // Auth routes - redirect to dashboard if already logged in
    const authPaths = ['/login', '/register']
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))

    if (isAuthPath && user) {
        const userType = user.user_metadata?.user_type || 'patient'
        const url = request.nextUrl.clone()

        if (userType === 'admin') {
            url.pathname = '/admin/dashboard'
        } else {
            url.pathname = userType === 'psychologist' ? '/psychologist/dashboard' : '/patient/dashboard'
        }

        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
