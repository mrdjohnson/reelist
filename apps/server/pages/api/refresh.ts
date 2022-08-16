import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { token },
  } = req

  res.status(200).json({ token })
}
