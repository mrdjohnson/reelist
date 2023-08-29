'use client'

import dynamic from 'next/dynamic'
import Logo from '../public/images/logo.png'

const DynamicComponentWithNoSSR = dynamic(() => import('../components/Discover'), { ssr: false })

const Page = () => {
  return <DynamicComponentWithNoSSR logo={Logo} />
}

export default Page
