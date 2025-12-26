import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listUsers() {
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      return
    }

    console.log('Users in auth:')
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`)
    })

    // Also check public.users table
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, is_admin')

    if (publicError) {
      console.error('Error listing public users:', publicError)
    } else {
      console.log('\nUsers in public.users table:')
      publicUsers.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id}, Admin: ${user.is_admin})`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function setAdmin(email) {
  try {
    // First get the user from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      return
    }

    const user = authUsers.users.find(u => u.email === email)
    if (!user) {
      console.error(`User with email ${email} not found in auth system.`)
      console.log(`\nTo create an admin profile for ${email}:`)
      console.log(`1. Have the user sign up at: http://localhost:3000/signup`)
      console.log(`2. Or use the production signup at your deployed URL`)
      console.log(`3. Then run this command again: node set-admin.js set ${email}`)
      return
    }

    console.log(`Found user: ${user.id} - ${user.email}`)

    // Update the user in public.users table
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        is_admin: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (updateError) {
      console.error('Error setting admin:', updateError)
    } else {
      console.log(`Successfully set ${email} as admin`)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Check command line arguments
const command = process.argv[2]
const email = process.argv[3]

if (command === 'list') {
  listUsers()
} else if (command === 'set' && email) {
  setAdmin(email)
} else {
  console.log('Usage:')
  console.log('  node set-admin.js list          # List all users')
  console.log('  node set-admin.js set <email>   # Set user as admin')
  process.exit(1)
}