import dynamic from 'next/dynamic'

const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/Discover'),
  { ssr: false }
)

export default DynamicComponentWithNoSSR