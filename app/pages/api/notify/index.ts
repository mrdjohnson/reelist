import type { NextApiRequest, NextApiResponse } from 'next'

import admin from 'firebase-admin'
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api'

// getMessaging
import serviceAccount from './secrets-firebase'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

export default async function notifyHandler(request: NextApiRequest, response: NextApiResponse) {
  const {
    query: { path, query },
    method,
  } = request

  if (method !== 'GET') {
    response.setHeader('Allow', ['GET'])
    response.status(405).end(`Method ${method} Not Allowed`)

    return
  }

  // const message: TokenMessage = {
  //   // data: {
  //   //   score: '850',
  //   //   time: '2:45',
  //   // },
  //   notification: {
  //     title: "DJ's 2nd test notification y'all",
  //     body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.',
  //   },
  //   // token: registrationToken,
  // }

  // admin
  //   .messaging()
  //   .send(message)
  //   .then(response => {
  //     // Response is a message ID string.
  //     console.log('Successfully sent message:', response)
  //   })
  //   .catch(error => {
  //     console.log('Error sending message:', error)
  //   })

  response.status(200).json({ data: 'hello world' })
}
