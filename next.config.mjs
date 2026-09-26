/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};
export default nextConfig;
