import { AppBar, Button, Drawer, Popover, Toolbar } from '@mui/material'
import { PropsWithChildren, ReactNode, useRef, useState } from 'react'
import Image from 'next/image'

const activeButton = 'border-red-400 border-1'
const defaultStyle = 'text-lg text-slate-300 px-5 rounded-l-full rounded-r-full '

const getButtonProps = (path: string, href: string) => {
  const activeStyle = path === href ? 'border border-solid border-red-400 ' : ''

  return { className: defaultStyle + activeStyle, href }
}

type NavBarProps = PropsWithChildren<{
  path: string
  rightButton?: ReactNode
  onRightButtonPressed: () => void
}>

const NavBar = ({ logo, path, children, rightButton, onRightButtonPressed }: NavBarProps) => {
  return (
    <>
      <AppBar
        className=" bg-reelist-light-gray discover-md:bg-reelist-gray discover-md:px-[55px] fixed left-0 right-0 top-0 h-14 px-[25px] py-2 shadow-none"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <div className="flex h-fit w-full justify-between">
          <a className="h-fit w-fit self-center text-slate-300 no-underline" href="/">
            <span className="discover-md:block hidden text-4xl">Reelist</span>
            <span className="discover-md:hidden flex h-fit">
              <Image src="/images/logo.png" width={40} height={40} alt="Reelist" priority />
            </span>
          </a>

          <div className="discover-md:flex hidden justify-end">
            <Button {...getButtonProps(path, '/')}>Home</Button>
            {/* <Button {...getButtonProps(path, '/about')}>About</Button> */}
            <Button {...getButtonProps(path, '/discover')}>Discover</Button>
          </div>

          {rightButton && <div onClick={onRightButtonPressed}>{rightButton}</div>}
        </div>
      </AppBar>

      <Drawer
        id="menu-button-popover"
        open={!!children}
        anchor="right"
        onClose={onRightButtonPressed}
        PaperProps={{
          className: 'bg-reelist-light-gray h-full mt-14',
        }}
      >
        <div className="bg-reelist-gradient-green h-full w-screen gap-x-3 px-[25px]">
          {children}
        </div>
      </Drawer>

      <Toolbar />
    </>
  )
}

export default NavBar
