/* eslint-disable */

import { fetch, Headers, FormData, Request, Response } from 'undici'

export default {
  displayName: 'libs',
  preset: '../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
    fetch,
    FormData,
    TextEncoder,
    TextDecoder,
    Response,
    Request,
    Headers,
  },
  setupFilesAfterEnv: ['<rootDir>/jestSetup.test.ts'],
  transform: {
    '^.+\\.[tj]s[x]$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/libs',
}
