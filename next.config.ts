import { env } from 'node:process';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import type { NextConfig } from 'next';

/**
 * This hacky way to set the global dispatcher for undici
 * so if the app is running behind a proxy, it will use the proxy
 */
if (env.HTTPS_PROXY || env.HTTP_PROXY) {
	const proxy_url = env.HTTPS_PROXY || env.HTTP_PROXY;
	if (!proxy_url) throw new Error('Proxy URL is not defined');

	const dispatcher = new ProxyAgent({
		uri: new URL(proxy_url).toString(),
	});
	setGlobalDispatcher(dispatcher);
}

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
