import type { NextConfig } from "next";

const serverOnlyPackages = [
  'pg',
  'pg-native',
  'pg-cloudflare',
  'pdfkit',
  'bcryptjs',
];

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: serverOnlyPackages,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  typescript: { ignoreBuildErrors: true },
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
