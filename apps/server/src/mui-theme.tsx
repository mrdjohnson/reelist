import { createTheme, responsiveFontSizes } from '@mui/material/styles'

const rootElement = () => document.getElementById('__next')

// Create a theme instance.
const theme = responsiveFontSizes(
  createTheme({
    components: {
      MuiPopover: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiDialog: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiModal: {
        defaultProps: {
          container: rootElement,
        },
      },
    },
  }),
)

export default theme
