'use client'

import dynamic from 'next/dynamic'
import Head from 'next/head'

import {
  OpenGraphType,
  TmdbOpenGraphFormatter,
} from '@reelist/utils/tmdbHelpers/TmdbOpenGraphFormatter'
import { TmdbClient } from '@reelist/utils/tmdbHelpers/TmdbClient'

const Page = () => (
    <>
      <Head>
        <title>Reelist Experiments</title>
      </Head>

      <div className="w-screen h-screen bg-gray-700 flex justify-items-center pt-14 flex-col">
        <span className="text-slate-300 w-full text-center text-5xl">Reelist's Experiments</span>
        <div className="text-slate-300 text-center text-xl mt-5">
          Welcome to our Experiments section, where we delve into the realm of innovation and exploration. Join us as we test hypotheses, push boundaries, and uncover new insights. From cutting-edge research to hands-on projects, embark on a journey of discovery with us.
        </div>
      </div>
    </>
  )

export default Page
