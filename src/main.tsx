import React from 'react'
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import App from './App.tsx'

const rootElement = () => document.getElementById('__next')

// Create a theme instance.
const theme = responsiveFontSizes(
  createTheme({
    typography: {
      fontFamily: 'Inter',

      button: {
        textTransform: 'none',
      },
    },
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
import './index.css'

export default function Main() {
  return (
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {/* <StoreProvider> */}
          <App />
          {/* </StoreProvider> */}
        </ThemeProvider>
      </StyledEngineProvider>
    </React.StrictMode>
  )
}
