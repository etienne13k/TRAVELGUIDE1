import type { NextConfig } from "next";

const serverOnlyPackages = [
  'pg',
  'pg-native',
  'pg-cloudflare',
  'pdfkit',
  'twilio',
  'bcryptjs',
];

const nextConfig: NextConfig = {
  serverExternalPackages: serverOnlyPackages,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push(...serverOnlyPackages);
      }
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        'pg-native': false,
        'pg-cloudflare': false,
        pdfkit: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
