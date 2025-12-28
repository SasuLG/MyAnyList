/** @type {import('next').NextConfig} */
const nextConfig = {
    // images: {
    //   unoptimized: true,
    //   domains: ['image.tmdb.org'],
    // },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'image.tmdb.org',
          pathname: '/t/p/**',
        },
      ],
  }

  };
  
  export default nextConfig;
  