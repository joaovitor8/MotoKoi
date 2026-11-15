import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // As fotos dos produtos ficam no bucket público "produtos" do Supabase Storage.
    remotePatterns: [new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/**`)],
  },
};

export default nextConfig;
