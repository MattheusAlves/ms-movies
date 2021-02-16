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
    }
}