const ipv4 = (ip: string): boolean => {
    const split_ip = ip.split(".")
    if (split_ip.length !== 4) return false
    for (const each_ip of split_ip) {
        if (!/^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/.test(each_ip)) return false
    }
    return true
}

const ipv6 = (ip: string): boolean => {
    const split_double_ip = ip.split("::")
    if (split_double_ip.length > 2) return false

    const split_ip = [
        split_double_ip[0].split(":"),
        (split_double_ip?.[1] ?? "").split(":")
    ]
    if (ip.includes("::")) {
        if ((split_ip[0].length + split_ip[1].length) > 7) return false
    } else {
        if (split_ip[0].length !== 8) return false
    }

    for (const each_split of split_ip) {
        if (each_split.length === 1 && each_split[0].length === 0)
            continue
        for (const each_ip of each_split) {
            if (!/^[A-Fa-f0-9]{1,4}$/.test(each_ip)) return false
            if (each_ip === '00' || each_ip === '000') return false
        }
    }
    return true
}

const ipv4subnetmask = (ip: string): boolean => {
    if (!ipv4(ip)) return false
    const each_ip: number[] = ip.split(".").map(d => parseInt(d))
    for (let i_start = 0; i_start < each_ip.length; i_start++) {
        if (each_ip[i_start] === 255) continue
        else if ([0, 128, 192, 224, 240, 248, 252, 254].includes(each_ip[i_start])) {
            for (let i_end = i_start + 1; i_end < each_ip.length; i_end++) {
                if (each_ip[i_end] !== 0) return false
            }
        } else return false
    }
    return true
}

export default { ipv4, ipv6, ipv4subnetmask }