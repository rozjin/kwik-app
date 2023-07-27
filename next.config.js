const withPWA = require('@imbios/next-pwa');
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true
    }
};

module.exports = withPWA({
    disable: !isProd,

    dest: 'public',
    register: true,
    skipWaiting: true
})(nextConfig);