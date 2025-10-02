import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Enable JSON imports
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    return config;
  },
  // Ensure core package templates are traced
  outputFileTracingIncludes: {
    '/api/convert': ['../../core/templates/**/*'],
  },
};

export default nextConfig;
