import { Button } from '@mui/material'

const activeButton = 'border-red-400 border-1'
const defaultStyle = 'text-lg text-slate-300 px-5 rounded-l-full rounded-r-full '

const getButtonProps = (path: string, href: string) => {
  const activeStyle = path === href ? 'border border-solid border-red-400 ' : ''

  return { className: defaultStyle + activeStyle, href }
}

const NavBar = ({ path }: { path: string }) => {
  return (
    <div className="discover-md:mb-8 mx-5 mb-4 mt-3">
      <div className="flex w-full justify-between">
        <a className="text-4xl text-slate-300 no-underline " href="/">
          Reelist
        </a>

        <div>
          <Button {...getButtonProps(path, '/')}>Home</Button>
          <Button {...getButtonProps(path, '/about')}>About</Button>
          <Button {...getButtonProps(path, '/discover')}>Discover</Button>
        </div>
      </div>
    </div>
  )
}

export default NavBar
