/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  env: {
    GEMINI_API_KEY_1: process.env.GEMINI_API_KEY_1,
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2,
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3,
  }
};

module.exports = nextConfig;