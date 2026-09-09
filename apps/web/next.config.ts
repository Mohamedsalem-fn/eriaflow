import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Pages compatible
  output: 'export',  // Static export for Cloudflare Pages
  trailingSlash: true,
  images: {
    unoptimized: true,  // Required for static export
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
