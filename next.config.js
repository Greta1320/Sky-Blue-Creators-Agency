/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // La extensión Halcón llama a la API desde chrome-extension://<id>.
  // Los headers CORS se añaden por ruta en src/lib/cors.ts.
};

module.exports = nextConfig;
