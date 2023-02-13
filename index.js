async function operator(proxies = []) {
    const _ = lodash

    const host = _.get($arguments, 'host') || 'dm.toutiao.com'
    const hostPrefix = _.get($arguments, 'hostPrefix')
    const hostSuffix = _.get($arguments, 'hostSuffix')
    // 注意我这里没改端口
    // 要改的话 是这样改 const port = _.get($arguments, 'port') || 80
    const port = _.get($arguments, 'port')

    const portPrefix = _.get($arguments, 'portPrefix')
    const portSuffix = _.get($arguments, 'portSuffix')
    const path = _.get($arguments, 'path') || '/'
    const pathPrefix = _.get($arguments, 'pathPrefix')
    const pathSuffix = _.get($arguments, 'pathSuffix')
    const method = _.get($arguments, 'method') || 'GET'
    const array = _.get($arguments, 'array') || true
    const defaultNetwork = _.get($arguments, 'defaultNetwork') || 'http'

    return proxies.map((p = {}) => {
        // 沃音乐 公免
        // 名称判断 _.includes(p.name, '沃音乐') || _.includes(p.name, '公免')
        // 或 path 判断
        if(_.chain(p).get('ws-opts.path').includes('gd.unicommusic.gtimg.com').value()){
            return p
        }
        let network = _.get(p, 'network')
        const type = _.get(p, 'type')
        /* 只修改 vmess 和 vless */
        if (_.includes(['vmess', 'vless'], type)) {
            if (!network) {
                network = defaultNetwork
                _.set(p, 'network', defaultNetwork)
            }
            if (host) {
                if (hostPrefix) {
                    _.set(p, 'name', `${hostPrefix}${p.name}`)
                }
                if (hostSuffix) {
                    _.set(p, 'name', `${p.name}${hostSuffix}`)
                }
                /* 把 非 server 的部分都设置为 host */
                _.set(p, 'servername', host)
                if (_.get(p, 'tls')) {
                    /* skip-cert-verify 在这里设为 true 有需求就再加一个节点操作吧 */
                    _.set(p, 'skip-cert-verify', true)
                    _.set(p, 'tls-hostname', host)
                    _.set(p, 'sni', host)
                }

                if (network === 'ws') {
                    _.set(p, 'ws-opts.headers.Host', host)
                } else if (network === 'h2') {
                    _.set(p, 'h2-opts.host', array ? [host] : host)
                } else if (network === 'http') {
                    _.set(p, 'http-opts.headers.Host', array ? [host] : host)
                } else {
                    // 其他? 谁知道是数组还是字符串...先按数组吧
                    _.set(p, `${network}-opts.headers.Host`, array ? [host] : host)
                }
            }
            if (method && network === 'http') {
                // clash meta 核报错 应该不是数组
                // _.set(p, 'http-opts.method', [method])
                _.set(p, 'http-opts.method', method)
            }
            if (port) {
                _.set(p, 'port', port)
                if (portPrefix) {
                    _.set(p, 'name', `${portPrefix}${p.name}`)
                }
                if (portSuffix) {
                    _.set(p, 'name', `${p.name}${portSuffix}`)
                }
            }

            if (path && network) {
                if (pathPrefix) {
                    _.set(p, 'name', `${pathPrefix}${p.name}`)
                }
                if (pathSuffix) {
                    _.set(p, 'name', `${p.name}${pathSuffix}`)
                }
                if (network === 'ws') {
                    _.set(p, 'ws-opts.path', path)
                } else if (network === 'h2') {
                    _.set(p, 'h2-opts.path', path)
                } else if (network === 'http') {
                    _.set(p, 'http-opts.path', array ? [path] : path)
                } else {
                    // 其他? 谁知道是数组还是字符串...先按字符串吧
                    _.set(p, `${network}-opts.path`, path)
                }
            }
        }

        // 如果不是 80 端口, 加个前缀标明
        // 一般用不到 测某些端口免不免的时候可能会用到
        if (String(p.port) !== '80'){
            _.set(p, 'name', `[${p.port}]${p.name}`)
        }
        // 如果是 VMESS HTTP, 加个前缀标明
        // 一般用不到 想单独测 HTTP 的时候可能会用到
        if (network === 'http') {
            _.set(p, 'name', `[HTTP]${p.name}`)
        }

        // 一个排序的例子 港>日>台>新>韩
        let sort = 0;
        if (p.name.includes('港')) {
            sort = 20;
        } else if (p.name.includes('日')) {
            sort = 19;
        } else if (p.name.includes('台')) {
            sort = 12;
        } else if (p.name.includes('新')) {
            sort = 11;
        } else if (p.name.includes('韩')) {
            sort = 10;
        }
        p._sort = sort;
        return p
    }).sort((a, b) => b._sort - a._sort);
}
