/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.steamcommunity.com',
      },
      {
        protocol: 'https',
        hostname: '**.akamaihd.net',
      },
      {
        protocol: 'https',
        hostname: '**.steamusercontent.com',
      }
    ]
  }
}

export default nextConfig

