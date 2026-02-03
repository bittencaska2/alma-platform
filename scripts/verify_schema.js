
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
    console.log('Verifying schema...')

    // Check profiles photo_url
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('photo_url')
        .limit(1)

    if (profilesError) {
        console.error('❌ Error selecting photo_url from profiles:', profilesError.message)
    } else {
        console.log('✅ Column photo_url exists in profiles')
    }

    // Check psychologists education
    const { data: psychologists, error: psychError } = await supabase
        .from('psychologists')
        .select('education')
        .limit(1)

    if (psychError) {
        console.error('❌ Error selecting education from psychologists:', psychError.message)
    } else {
        console.log('✅ Column education exists in psychologists')
    }
}

verifySchema()
