import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  onRefresh: () => void
  isInfinite: boolean
}

const InfiniteScroll: React.FC<Props> = ({ children, onRefresh, isInfinite }) => {
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
    <div className="relative h-full min-h-[100] w-full">
      {children}

      {isInfinite && <div ref={infiniteRef} className="absolute bottom-10 h-4" />}
    </div>
  )
}

export default InfiniteScroll
