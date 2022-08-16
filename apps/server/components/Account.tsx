import { useUser } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { supabaseClient as supabase, supabaseClient } from '../utils/supabaseClient'
import { Button } from '@mui/material'
import Router, { useRouter } from 'next/router'

export default function Account() {
  const { user, error } = useUser()
  const { query } = useRouter()

  const [mobileRefreshToken, setMobileRefreshToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  useEffect(() => {
    if (!user) return

    getProfile()
  }, [user])

  useEffect(() => {
    const redirectTo = query.redirectTo || '/api/refresh?token='

    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)

      const refreshToken = session?.refresh_token

      if (refreshToken) {
        setMobileRefreshToken(refreshToken)
        Router.push('reelist://refresh/' + refreshToken)
      }
    })
  }, [query])

  async function getProfile() {
    try {
      setLoading(true)

      const trialUser = user

      console.log('user: ', trialUser)

      const client = supabaseClient

      // debugger

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const redirectToMobile = () => {
    Router.push('reelist://refresh/' + mobileRefreshToken)
  }

  if (error) {
    return <div>{error.message}</div>
  }
  if (!user) {
    return (
      <div>
        No user loaded <Button href="/">Go Home</Button> Page Ref: {query.redirectTo}
        {mobileRefreshToken && <Button onClick={redirectToMobile}>Go back to Reelist app</Button>}
      </div>
    )
  }

  return (
    <div className="form-widget">
      Page Ref: {query.redirectTo}
      <div>
        <label htmlFor="email">Email</label>

        <input id="email" type="text" value={user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>

        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>

        <input
          id="website"
          type="website"
          value={website || ''}
          onChange={e => setWebsite(e.target.value)}
        />
      </div>
      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>
      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
      {mobileRefreshToken && <Button onClick={redirectToMobile}>Go back to Reelist app</Button>}
    </div>
  )
}
