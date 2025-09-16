const dns = require('dns').promises
const ipaddr = require('ipaddr.js')

function isPrivateIP (ip) {
    if (ip === '127.0.0.1' && process.env.NODE_ENV === 'development') {
        return false
    }
    let addr
    try {
        addr = ipaddr.parse(ip)
    } catch (e) {
        return true
    }

    if (addr.kind() === 'ipv4') {
        const range = addr.range()
        return (
            range === 'private'
                || range === 'loopback'
                || range === 'linkLocal'
                || range === 'broadcast'
                || range === 'carrierGradeNat'
                || range === 'unspecified'
        )
    } else if (addr.kind() === 'ipv6') {
        return (
            addr.isLoopback()
                || addr.range() === 'uniqueLocal'
                || addr.range() === 'linkLocal'
        )
    }
    return false
}

function checkPort (port) {
    port = parseInt(port)
    // 禁止端口
    const forbiddenPort = [21, 22, 23, 25, 69, 135, 137, 138, 139,
        161, 162, 389, 465, 514, 587, 636, 873, 1099, 2181, 2375,
        2376, 27017, 3306, 3389, 36000, 4848, 50070, 50075, 5432,
        56000, 5900, 5901, 6379, 7001, 7002, 9200, 9300, 10050, 10051,
        10250, 10255, 11211]
    return forbiddenPort.includes(port)
}

// 获取当前环境的主域名
function getMainDomain (origin) {
    try {
        const url = new URL(origin)
        const hostnameParts = url?.hostname?.split('.')
        const partsLength = hostnameParts?.length

        // 如果域名部分少于2个，返回null
        if (partsLength < 2) {
            return null
        }

        // 提取主域名
        const mainDomain = hostnameParts.slice(partsLength - 2).join('.')
        return `.${mainDomain}`
    } catch (error) {
        console.error('Invalid URL:', error)
        return null
    }
}

export const validateUrl = async (userInputUrl, originalUrl, whiteList = []) => {
    let parsedUrl = ''
    try {
        parsedUrl = new URL(userInputUrl)
    } catch (err) {
        return {
            result: false,
            message: 'url异常'
        }
    }

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
            result: false,
            message: '只允许http跟https协议'
        }
    }

    // 域名必须在白名单
    const domain = getMainDomain(originalUrl)
    if (!domain) {
        return {
            result: false,
            message: '无法解析需要访问的域名'
        }
    }
    const targetDomain = getMainDomain(userInputUrl)
    if (!parsedUrl.hostname?.endsWith(domain) && !whiteList?.includes(targetDomain)) {
        return {
            result: false,
            message: '只允许访问跟当前环境同域的域名'
        }
    }

    const port = parsedUrl.port
    if (port && checkPort(port)) {
        return {
            result: false,
            message: '禁止使用此端口'
        }
    }
    // 解析域名对应的 IP 地址，防止 DNS 解析绕过
    const addresses = await dns.lookup(parsedUrl.hostname, { all: true })
    for (const addr of addresses) {
        if (isPrivateIP(addr.address)) {
            return {
                result: false,
                message: '禁止访问私有ip'
            }
        }
    }

    return {
        result: true,
        message: ''
    }
}
