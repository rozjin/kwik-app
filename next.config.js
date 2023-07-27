const withPWA = require('@imbios/next-pwa');
const runtimeCaching = require('@imbios/next-pwa/cache');

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true
    }
};

const nextConfig = withPWA({
    dest: 'public',
    runtimeCaching
})(config);

module.exports = nextConfig;