module.exports = {
    images: {
        domains: ['image.tmdb.org', 'localhost']
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/movies',
                permanent: true
            }
        ]
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        return config;
    }
}