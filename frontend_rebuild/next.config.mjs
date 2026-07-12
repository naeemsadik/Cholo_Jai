/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.cholojai.bd" },
      { protocol: "https", hostname: "cholo-jai-backend.uiucomputerclub.com" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
