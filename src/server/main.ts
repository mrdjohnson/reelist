import express from 'express'
import ViteExpress from 'vite-express'
import makeOpenGraphCard from './utils/makeOpenGraphCard'

const app = express()

const transformer = async (html: string, req: express.Request) => {
  const openGraphHeaders = await makeOpenGraphCard(req.query)

  return html.replace('<!-- og_headers -->', openGraphHeaders)
}

ViteExpress.config({ transformer })

ViteExpress.listen(app, 3000, () => console.log('Server is listening on port 3000...'))
