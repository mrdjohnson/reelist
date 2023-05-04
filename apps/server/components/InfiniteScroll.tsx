import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  onRefresh: () => void
}

const InfiniteScroll: React.FC<Props> = ({ children, onRefresh }) => {
  const infiniteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onRefresh()
      }
    }, options)

    if (infiniteRef.current) {
      observer.observe(infiniteRef.current)
    }

    return () => {
      if (infiniteRef.current) {
        observer.unobserve(infiniteRef.current)
      }
    }
  }, [onRefresh])

  return (
    <div className="w-full h-full min-h-[100] relative">
      {children}

      <div ref={infiniteRef} className="h-4 absolute bottom-10" />
    </div>
  )
}

export default InfiniteScroll
