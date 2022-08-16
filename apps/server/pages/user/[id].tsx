import type { User } from '../../interfaces'
import { useRouter } from 'next/router'
import useSwr from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function UserPage() {
  const router = useRouter()
  const { id, name } = router.query

  let path = `/api/user/${id}`

  if (name) {
    path += `?name=${name}`
  }
  const { data, error } = useSwr<User>(router.query.id ? path : null, fetcher)

  // debugger

  if (error) return <div>Failed to load user</div>
  if (!data) return <div>Loading...</div>

  return <div>{data.name}</div>
}
