import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignora erros de tipagem estrita no build de produção
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora avisos do ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;