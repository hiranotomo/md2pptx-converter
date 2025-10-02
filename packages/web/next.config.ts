import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure core package templates are traced for serverless functions
  outputFileTracingIncludes: {
    '/api/**/*': [
      '../../core/templates/**/*.json',
      '../../core/dist/**/*',
    ],
  },
  // Set explicit output file tracing root for monorepo
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
};

export default nextConfig;
