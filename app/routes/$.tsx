import { redirect } from '@remix-run/node'

export const loader = async () => {
  return redirect('/', 303)
}

export default function Component() {
  return null // This route does not render any UI
}
