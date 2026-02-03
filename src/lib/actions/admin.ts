'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createBaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Create a generic client for Auth creation to avoid clobbering Admin session
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function createPsychologist(prevState: any, formData: FormData) {
    const adminSupabase = await createClient()

    // 1. Verify Admin permissions
    const { data: { user: adminUser } } = await adminSupabase.auth.getUser()
    const userType = adminUser?.user_metadata?.user_type

    if (userType !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const crp = formData.get('crp') as string
    const whatsapp = formData.get('whatsapp') as string
    const specialties = formData.get('specialties') as string // JSON string
    const bio = formData.get('bio') as string
    const price = formData.get('price') as string
    const photo = formData.get('photo') as File | null
    let photoUrl = null

    if (photo && photo.size > 0) {
        // Safe file name
        const fileExt = photo.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await adminSupabase.storage
            .from('avatars')
            .upload(filePath, photo)

        if (!uploadError) {
            const { data: publicUrlData } = adminSupabase.storage
                .from('avatars')
                .getPublicUrl(filePath)
            photoUrl = publicUrlData.publicUrl
        }
    }

    // 2. Create Auth User (using generic client)
    const baseSupabase = createBaseClient(supabaseUrl, supabaseAnonKey)
    const { data: authData, error: authError } = await baseSupabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                user_type: 'psychologist',
                crp: crp
            }
        }
    })

    if (authError) {
        return { error: `Auth Error: ${authError.message}` }
    }

    if (!authData.user) {
        return { error: 'Failed to create user' }
    }

    const newUserId = authData.user.id

    // 3. Insert specific records using ADMIN client (privileged)

    // Profile
    const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: newUserId,
        user_type: 'psychologist',
        full_name: fullName,
        email: email,
        whatsapp: whatsapp,
        photo_url: photoUrl
    })

    if (profileError) {
        return { error: `Profile Error: ${profileError.message}` }
    }

    // Psychologist
    const { error: psyError } = await adminSupabase.from('psychologists').upsert({
        id: newUserId,
        crp: crp,
        is_active: true,
        is_verified: true, // Auto verify since Admin created it
        bio: bio,
        specialties: specialties ? JSON.parse(specialties) : [],
        session_price: parseFloat(price) || 160.00,
        filled_slots: 0
    })

    if (psyError) {
        return { error: `Psychologist Data Error: ${psyError.message}` }
    }

    revalidatePath('/admin/psychologists')
    return { success: true, message: 'Psicólogo criado com sucesso!' }
}
