module.exports = config => {
    const FETCHED = new Map()

    const makeFetch = query => {
        // Get promise of resolution
        const fetching = config.resolve(query)
        // Set that as the query arg
        return FETCHED.set(query, fetching).get(query)
    }

    const request = async query => {
        // wait for the response
        const response = await makeFetch(query)
        // return the needed value
        return response
    }

    const get = async id => {
        if (!FETCHED.has(id)) {
            return request(id)
        }

        return FETCHED.get(id)
    }

    const drop = id => FETCHED.delete(id)

    return ({
        get,
        drop,
    })
}