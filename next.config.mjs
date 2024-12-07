// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com'], // Add any other domains you need
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // You might want to set this to false in production
  },
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', '@radix-ui/react-icons'],
  }
};

export default nextConfig;