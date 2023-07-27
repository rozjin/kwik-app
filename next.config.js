const withPWA = require('@imbios/next-pwa');
const runtimeCaching = require('next-pwa/cache')

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
    runtimeCaching,
    register: true,
    skipWaiting: true,

    dynamicStartUrl: false
})(nextConfig);