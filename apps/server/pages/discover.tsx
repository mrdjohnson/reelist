'use client'

import dynamic from 'next/dynamic'
import NavBar from '~/components/NavBar'

const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/Discover'),
  { ssr: false }
)

const Page = () => {
  return (
    <>

    <NavBar path="/discover" />

    <DynamicComponentWithNoSSR />
    
    </>
  )
}

export default Page