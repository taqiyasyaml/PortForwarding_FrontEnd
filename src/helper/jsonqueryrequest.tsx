
const JSONtoSubQueries = (data: object, prefix?: string): string[] => {
    const subqueries: string[] = []
    if (data === null) return subqueries
    if (prefix === undefined && Array.isArray(data))
    prefix = ''
    for (const [key, val] of Object.entries(data)) {
        const tmp_prefix: string = prefix === undefined ? encodeURIComponent(key) : `${prefix}[${encodeURIComponent(key)}]`
        if (val === null) subqueries.push(`${tmp_prefix}=null`)
        else if (typeof val === 'object') subqueries.push(...JSONtoSubQueries(val, tmp_prefix))
        else if (typeof val === 'string') subqueries.push(`${tmp_prefix}=${encodeURIComponent(val)}`)
        else if (typeof val === 'number' || typeof val === 'boolean') subqueries.push(`${tmp_prefix}=${val.toString()}`)
    }
    return subqueries
}

const JSONtoQueryRequest = (data: object): string => JSONtoSubQueries(data).join('&')

export default JSONtoQueryRequest