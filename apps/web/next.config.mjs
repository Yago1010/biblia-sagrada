/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@biblia/core', '@biblia/server'],
  reactStrictMode: true,
};

export default nextConfig;
