import { PropsWithChildren } from 'react'

const FooterLink = ({ href, children }: PropsWithChildren<{ href: string }>) => (
  <a
    href={href}
    className="hover:text-reelist-red pl-1 text-gray-500 underline underline-offset-[3px] transition-all duration-300 ease-in-out"
  >
    {children}
  </a>
)

const Footer = ({
  designerName,
  designerLink,
  hideHeader = false,
}: {
  designerName?: string
  designerLink?: string
  hideHeader?: boolean
}) => (
  <div className="flex flex-col justify-center gap-3 py-8 text-center text-gray-500 ">
    {!hideHeader && <span className="text-reelist-red pb-3 text-3xl">Reelist</span>}
    Copyright @2023 All rights reserved
    <div>
      Video Source:
      <FooterLink href="https://www.themoviedb.org/">TMDB</FooterLink>
      {' | '}
      Streaming Source:
      <FooterLink href="https://www.justwatch.com/">Just Watch</FooterLink>
    </div>
    <div>
      {designerName && (
        <span>
          Designed by:
          <FooterLink href={designerLink}>{designerName}</FooterLink>
          {' | '}
        </span>
      )}
      Source:
      <FooterLink href="https://github.com/mrdjohnson/reelist">Github</FooterLink>
    </div>
  </div>
)

export default Footer
