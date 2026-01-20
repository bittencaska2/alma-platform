'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Update patient profile - saves to both profiles table and user metadata
export async function updatePatientProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Não autorizado' }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    // Update user metadata (this always works with Supabase Auth)
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            phone: phone,
            address: address,
        }
    })

    if (metadataError) {
        console.error('Metadata update error:', metadataError)
        return { error: metadataError.message }
    }

    // Try to upsert to profiles table (if it exists)
    try {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                user_type: 'patient',
                full_name: fullName,
                phone: phone,
                email: user.email,
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('Profile upsert error:', profileError)
            // Don't fail - metadata was saved
        }
    } catch (e) {
        console.error('Profile table error:', e)
        // Table might not exist, but metadata was saved
    }

    revalidatePath('/patient/settings')
    revalidatePath('/patient/dashboard')
    return { success: true }
}

// Update psychologist profile
export async function updatePsychologistProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Não autorizado' }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? JSON.parse(specialtiesStr) : []
    const yearsOfExperience = formData.get('yearsOfExperience') as string

    // Update user metadata (this always works with Supabase Auth)
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            phone: phone,
            bio: bio,
            specialties: specialties,
            years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        }
    })

    if (metadataError) {
        console.error('Metadata update error:', metadataError)
        return { error: metadataError.message }
    }

    // Try to upsert to profiles table (if it exists)
    try {
        await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                user_type: 'psychologist',
                full_name: fullName,
                phone: phone,
                email: user.email,
            }, { onConflict: 'id' })
    } catch (e) {
        console.error('Profile table error:', e)
    }

    // Try to update psychologists table (if it exists)
    try {
        await supabase
            .from('psychologists')
            .upsert({
                id: user.id,
                crp: user.user_metadata?.crp || '',
                bio: bio,
                specialties: specialties,
                years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
            }, { onConflict: 'id' })
    } catch (e) {
        console.error('Psychologists table error:', e)
    }

    revalidatePath('/psychologist/profile')
    revalidatePath('/psychologist/dashboard')
    return { success: true }
}

// Update psychologist schedule/availability
export async function updatePsychologistSchedule(
    psychologistId: string,
    slots: { dayOfWeek: number; startTime: string; endTime: string }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== psychologistId) {
        return { error: 'Não autorizado' }
    }

    // Save schedule to user metadata (reliable storage)
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            schedule_slots: slots,
        }
    })

    if (metadataError) {
        console.error('Schedule metadata error:', metadataError)
        return { error: metadataError.message }
    }

    // Try to save to availability_slots table (if it exists)
    try {
        // Delete existing slots
        await supabase
            .from('availability_slots')
            .delete()
            .eq('psychologist_id', psychologistId)

        // Insert new slots
        if (slots.length > 0) {
            const dayMap: { [key: number]: string } = {
                0: 'sunday',
                1: 'monday',
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday',
                6: 'saturday',
            }

            const slotsToInsert = slots.map(slot => ({
                psychologist_id: psychologistId,
                day_of_week: dayMap[slot.dayOfWeek],
                start_time: slot.startTime,
                end_time: slot.endTime,
                is_active: true,
            }))

            await supabase
                .from('availability_slots')
                .insert(slotsToInsert)
        }
    } catch (e) {
        console.error('Availability slots error:', e)
        // Table might not exist, but metadata was saved
    }

    revalidatePath('/psychologist/schedule')
    return { success: true }
}
