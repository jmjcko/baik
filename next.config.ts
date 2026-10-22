import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The knowledge base (docs/knowledge) is read from disk by server actions; make sure it ships with them.
  outputFileTracingIncludes: {
    '/**': ['./docs/knowledge/*.md'],
  },
};

export default nextConfig;
