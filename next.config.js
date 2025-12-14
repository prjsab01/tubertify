/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    return config
  }
}

module.exports = nextConfig