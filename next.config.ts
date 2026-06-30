import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [],
};

export default withNextIntl(nextConfig);
