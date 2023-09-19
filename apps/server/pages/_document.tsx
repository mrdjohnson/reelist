import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/images/logo.png" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <body style={{ margin: '0', backgroundColor: 'rgb(19, 19, 19)' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
