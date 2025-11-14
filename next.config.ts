import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	devIndicators: false,
};

const withNextIntl = createNextIntlPlugin("./src/lib/intl/request.ts");

export default withNextIntl(nextConfig);
