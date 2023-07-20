import { Button } from '@mui/material'

const activeButton = 'border-red-400 border-1'
const defaultStyle = 'text-lg text-slate-300 px-5 rounded-l-full rounded-r-full '

const getButtonProps = (path: string, href: string) => {
  const activeStyle = path === href ? 'border border-solid border-red-400 ' : ''

  return { className: defaultStyle + activeStyle, href }
}

const NavBar = ({ path }: { path: string }) => {
  return (
    <div className="discover-md:pb-8 bg-reelist-gray sticky top-0 left-0 right-0 z-10 px-5 pb-4 pt-3">
      <div className="flex w-full justify-between">
        <a className="text-4xl text-slate-300 no-underline " href="/">
          Reelist
        </a>

        <div>
          <Button {...getButtonProps(path, '/')}>Home</Button>
          {/* <Button {...getButtonProps(path, '/about')}>About</Button> */}
          <Button {...getButtonProps(path, '/discover')}>Discover</Button>
        </div>
      </div>
    </div>
  )
}

export default NavBar
