import { Button, Popover } from '@mui/material'
import { PropsWithChildren, useRef, useState } from 'react'
import Image from 'next/image'

const activeButton = 'border-red-400 border-1'
const defaultStyle = 'text-lg text-slate-300 px-5 rounded-l-full rounded-r-full '

const getButtonProps = (path: string, href: string) => {
  const activeStyle = path === href ? 'border border-solid border-red-400 ' : ''

  return { className: defaultStyle + activeStyle, href }
}

const NavBar = ({ path }: { path: string }) => {
  const menuButtonRef = useRef()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-reelist-gray sticky top-0 left-0 right-0 z-10 px-5 pb-4 pt-3">
      <div className="flex h-fit w-full justify-between">
        <a className="h-fit w-fit self-center text-slate-300 no-underline" href="/">
          <span className="discover-md:block hidden text-4xl">Reelist</span>
          <span className="discover-md:hidden flex h-fit text-2xl">
            {/* todo, get image working on build */}
            {/* <Image src="/static/logo.png" width={50} height={50} alt="Picture of the author" /> */}
            Reelist
          </span>
        </a>

        <div className="discover-md:flex hidden justify-end">
          <Button {...getButtonProps(path, '/')}>Home</Button>
          {/* <Button {...getButtonProps(path, '/about')}>About</Button> */}
          <Button {...getButtonProps(path, '/discover')}>Discover</Button>
        </div>

        <div
          className="discover-md:hidden align flex justify-end text-white"
          ref={menuButtonRef}
          onClick={() => setIsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="h-full w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>

        <Popover
          id="menu-button-popover"
          open={isOpen}
          anchorEl={menuButtonRef.current}
          onClose={() => setIsOpen(false)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            className: 'bg-reelist-gray backdrop-blur-md gap-x-3',
          }}
        >
          <Button {...getButtonProps(path, '/')}>Home</Button>
          {/* <Button {...getButtonProps(path, '/about')}>About</Button> */}
          <Button {...getButtonProps(path, '/discover')}>Discover</Button>
        </Popover>
      </div>
    </div>
  )
}

export default NavBar
