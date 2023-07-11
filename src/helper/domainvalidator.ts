interface ConfDomainValidator {
    wildcard?: boolean,
    min_length_maindomain?: number,
    min_length_maindomain_wildcard?: number
}

const subdomain = (domain: string): boolean => {
    if (domain.length < 1 || domain.length > 64) return false
    if (domain[0] === '-' || domain[domain.length - 1] === '-') return false
    if (!/^[A-Za-z0-9-]+$/.test(domain)) return false
    return true
}
const maindomain = (domain: string, conf_params?: ConfDomainValidator): boolean => {
    const conf: ConfDomainValidator = {
        wildcard: conf_params?.wildcard ?? false,
        min_length_maindomain: conf_params?.min_length_maindomain ?? 3,
        min_length_maindomain_wildcard: conf_params?.min_length_maindomain_wildcard ?? 4
    }
    let min_length_maindomain: number = conf?.min_length_maindomain ?? 3

    if (domain.length === 0 || domain.length > 255) return false

    const sub_domain = domain.split(".")

    if (sub_domain[0] === "*") {
        if (conf.wildcard !== true) return false
        else {
            sub_domain.shift()
            min_length_maindomain = conf?.min_length_maindomain_wildcard ?? 4
        }
    }
    if (sub_domain.length < 2) return false

    const tld = sub_domain[sub_domain.length - 1]
    if (tld.length < 2 || tld.length > 6) return false
    if (!/^[a-zA-Z]+$/.test(tld)) return false

    if (
        (sub_domain.length === 2 && sub_domain[0].length < min_length_maindomain) ||
        (sub_domain.length === 3 && sub_domain[1].length < min_length_maindomain && sub_domain[0].length < min_length_maindomain)
    ) return false

    for (const sub of sub_domain) {
        if (!subdomain(sub)) return false
    }
    return true
}

export default { subdomain, maindomain }