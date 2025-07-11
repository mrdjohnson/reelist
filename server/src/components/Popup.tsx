import { Drawer, Toolbar, Dialog, DrawerProps, CircularProgress } from '@mui/material'
import CloseIcon from 'apps/server/components/heroIcons/CloseIcon'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

const DialogPaperProps = {
  style: {
    background:
      'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%)',
    backdropFilter: 'blur(15px)',
    maxWidth: '1619px',
    position: 'relative',
    overflowY: 'scroll',
    overflowX: 'clip',
    cursor: 'default',
  },
}

type PopupProps = DrawerProps & {
  isOpen: boolean
  isMobile: boolean
  isLoading?: boolean
  onClose?: () => void
}

const Popup = ({
  children,
  isOpen = false,
  isMobile = false,
  onClose,
  isLoading,
  ...props
}: PopupProps) => {
  const router = useRouter()

  const goToDiscoverHome = () => {
    router.replace('/discover', undefined, { shallow: true })
  }

  const handleClose = onClose || goToDiscoverHome

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onClose={handleClose}
        anchor="bottom"
        PaperProps={DialogPaperProps}
        classes={{ paper: 'relative p-2 pb-6 w-full h-full' }}
        className=" bg-transparent-dark cursor-pointer backdrop-blur-md"
        transitionDuration={{ exit: 50 }}
        hideBackdrop
        {...props}
      >
        <Toolbar />

        {isLoading ? (
          <CircularProgress size="60px" className="text-reelist-red m-12 mt-40 self-center" />
        ) : (
          children
        )}
      </Drawer>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={DialogPaperProps}
      classes={{
        paper:
          'discover-md:p-[38px] discover-md:pr-[60px] discover-md:my-0 discover-md:mx-8 discover-md:h-auto discover-md:w-auto absolute top-0 left-0 h-screen w-screen p-3 m-2',
      }}
      className="bg-transparent-dark h-screen w-screen cursor-pointer backdrop-blur-md"
      transitionDuration={{ exit: 50 }}
      hideBackdrop
      {...props}
    >
      <div
        className="text-reelist-red absolute right-2 top-2 cursor-pointer lg:top-2"
        onClick={handleClose}
      >
        <CloseIcon className="h-8" />
      </div>

      {isLoading ? <CircularProgress size="60px" className="text-reelist-red m-12" /> : children}
    </Dialog>
  )
}

export default Popup
