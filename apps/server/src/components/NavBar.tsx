import { Button } from '@mui/material'

const activeButton = 'border-red-400 border-1'
const defaultStyle = 'text-lg text-slate-300 px-5 '

const getButtonProps = (path: string, href: string) => {
  const activeStyle =
    path === href ? 'border border-solid border-red-400 rounded-l-full rounded-r-full' : ''

  return { className: defaultStyle + activeStyle, href }
}

const NavBar = ({ path }: { path: string }) => {
  return (
    <div className="flex w-full mb-12 justify-between">
      <a className="text-4xl text-slate-300 no-underline " href="/">
        Reelist
      </a>

      <div>
        <Button {...getButtonProps(path, '/')}>Home</Button>
        <Button {...getButtonProps(path, '/about')}>About</Button>
        <Button {...getButtonProps(path, '/discover')}>Discover</Button>
      </div>
    </div>
  )
}

export default NavBar
