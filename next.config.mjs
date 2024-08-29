/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '/docs',
    output: 'export',
    assetPrefix: '/`',
    basePath: '',
    reactStrictMode: true,
    cleanDistDir: true,
    trailingSlash: true
};

export default nextConfig;