/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: false,
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        {
          bufferutil: "commonjs bufferutil",
          "utf-8-validate": "commonjs utf-8-validate",
        },
      );
    }

    return config;
  },
};

export default nextConfig;
