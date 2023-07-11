import domainvalidator from "./domainvalidator"
import ipvalidator from "./ipvalidator"
export default (email: string): boolean => {
    const split_local_domain = email.split("@")
    if (split_local_domain.length === 1 || split_local_domain.length > 2) return false

    const [local_part, domain] = split_local_domain

    if (local_part.length === 0 || local_part.length > 64) return false
    if (local_part[0] === "." || local_part[local_part.length - 1] === ".") return false

    const split_dot = local_part.split(".")
    for (const each_part of split_dot) {
        if (each_part.length === 0) return false
        if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/.test(each_part)) return false
    }

    if (domain.length > 2 && domain[0] === "[" && domain[domain.length - 1] == "]") {
        const ip = domain.substring(1, domain.length - 1)
        if (!ipvalidator.ipv4(ip) && !ipvalidator.ipv6(ip)) return false
    } else if (!domainvalidator.maindomain(domain)) return false

    return true
}