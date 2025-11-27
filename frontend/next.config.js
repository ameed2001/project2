/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
    'https://3000-firebase-studio-1749387595678.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
    'https://6000-firebase-studio-1749387595678.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/__nextjs_original-stack-frames',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.cloudworkstations.dev; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://*.cloudworkstations.dev; " +
              "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
              "img-src 'self' data: https://i.imgur.com https://imgur.com https://placehold.co https://upload.wikimedia.org; " +
              "connect-src 'self' wss://*.cloudworkstations.dev https://*.cloudworkstations.dev;",
          },
          { key: 'Set-Cookie', value: 'SameSite=Strict; Secure' },
          {
            key: 'Permissions-Policy',
            value: "usb=(), serial=(), hid=(), autoplay=*, cross-origin-isolated=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
