// passing URL parameters method from:
// https://stackoverflow.com/questions/35038857/setting-query-string-using-fetch-get-request
async function apiUtil(path, options) {
    console.log(path)
    let r = await fetch(path, options)
    if (r.status === 200) {
        return r.json()
    } else {
        let err = await r.json()
        throw new Error(err.error)
    }
}

export default function searchGoogleNews(query) {
    const options = {
        method: 'GET',
        headers: {
            'X-Api-Key': 'placeholder'
        }
    }
    const params = new URLSearchParams({
        q: query
    })

    return apiUtil('https://newsapi.org/v2/everything?' + params, options)
}
