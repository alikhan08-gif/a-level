import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // pdfkit loads its standard-font .afm files from its own package
  // directory at runtime — keeping it external (not bundled) so Next's
  // output tracing copies those files alongside it in the serverless build.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
