'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const userType = formData.get('userType') as 'patient' | 'psychologist'
    const crp = formData.get('crp') as string | null

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                user_type: userType,
                crp: crp || null,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // If email confirmation is disabled, user is logged in immediately
    if (data.user) {
        // Create profile in database
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            user_type: userType,
            full_name: name,
            email: email,
        })

        if (profileError) {
            console.error('Profile creation error:', profileError)
        }

        // Create specific table entry based on user type
        if (userType === 'psychologist' && crp) {
            await supabase.from('psychologists').upsert({
                id: data.user.id,
                crp: crp,
                is_active: true,
                is_verified: false,
                session_price: 160.00,
            })
        } else if (userType === 'patient') {
            await supabase.from('patients').upsert({
                id: data.user.id,
            })
        }

        // Redirect to appropriate dashboard
        redirect(userType === 'psychologist' ? '/psychologist/dashboard' : '/patient/dashboard')
    }

    return { success: true, message: 'Conta criada! Verifique seu e-mail para confirmar.' }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const userType = formData.get('userType') as 'patient' | 'psychologist'

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user) {
        // Get user type from metadata or profile
        const storedUserType = data.user.user_metadata?.user_type || userType

        // Redirect to appropriate dashboard
        if (storedUserType === 'admin') {
            redirect('/admin/dashboard')
        }
        redirect(storedUserType === 'psychologist' ? '/psychologist/dashboard' : '/patient/dashboard')
    }

    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
