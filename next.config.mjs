/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['10.76.31.182'],
  turbopack: {
    root: '/home/yashh/Downloads/b_Li1cljARhAY-1772267104005',
  },
}

export default nextConfig
