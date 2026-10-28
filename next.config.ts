import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // `output: 'standalone'` was here to build a small Docker image for Coolify
  // on Hetzner. That host is gone (28 Oct 2026) and Vercel builds from the
  // repository directly, so it had no remaining reader. Removed with the
  // Dockerfile rather than left as config nobody can explain.
  reactStrictMode: true,
  poweredByHeader: false,
}

export default nextConfig
