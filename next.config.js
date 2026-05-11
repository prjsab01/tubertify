/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    if (!isServer) {
      // Prevent firebase-admin and Node.js-only modules from being bundled client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
      }
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', '@google-cloud/firestore'],
  },
}

module.exports = nextConfig
