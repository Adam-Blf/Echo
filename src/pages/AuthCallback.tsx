import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth')
          return
        }

        if (session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile && profile.first_name) {
            // User has completed onboarding
            navigate('/')
          } else {
            // User needs to complete onboarding
            navigate('/onboarding')
          }
        } else {
          navigate('/auth')
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/auth')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-white/60">Connexion en cours...</p>
      </div>
    </div>
  )
}
