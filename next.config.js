/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.openweathermap.org'],
  },
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
