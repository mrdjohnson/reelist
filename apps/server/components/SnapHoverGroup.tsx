import classNames from 'classnames'
import { HTMLAttributes } from 'react'

export const SnapHoverItem = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames(className, 'snap-start snap-normal')} {...props}>
      {children}
    </div>
  )
}

export const SnapHoverGroup = ({ className, children }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        className,
        'no-scrollbar flex w-full cursor-pointer snap-x snap-mandatory gap-x-5 overflow-x-scroll',
      )}
    >
      {children}
    </div>
  )
}
