import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const apiProxyTarget = (
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1'
).replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
