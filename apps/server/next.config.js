const env = process.env.NODE_ENV || 'development'
const basePath = process.env.BASE_PATH || undefined

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNativebase } = require('@native-base/next-adapter');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  output: 'standalone',
  basePath,
}

module.exports = withNativebase(nextConfig)
