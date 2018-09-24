const
    https = require('https'),
    tls = require('tls'),
    dns = require('dns'),
    httpProxy = require('http-proxy'),
    forge = require('node-forge')

proxy = httpProxy.createProxyServer({});

forge.options.usePureJavaScript = true;

var
    ctx = {},
    dns_cache = {},
    pki = forge.pki,
    keys = pki.rsa.generateKeyPair(2048),
    defaultSSL = createSSL('localhost.localhost');

https
    .createServer(
        {
            SNICallback: (d, c) => (ctx[d] || createSSL(d)) && c(null, ctx[d]),
            key: defaultSSL.key,
            cert: defaultSSL.cert,
        },
        async (req, res) => await DNSLookUp(req.headers.host) ? proxy.web(req, res, { target: { host: req.headers.host, protocol: 'http' } }) : res.end('Unable to find domain. Check HOSTS file.'))
    .listen(443);

async function DNSLookUp(domain) {
    return dns_cache.hasOwnProperty(domain) ? dns_cache[domain] : new Promise(res => dns.lookup(domain, {}, (e, a) => { dns_cache[domain] = !!a; res(dns_cache[domain]) }))
}
function createSSL(domain) {
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    var attrs = [{ name: 'commonName', value: domain }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);
    var config = {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert),
    }
    ctx[domain] = tls.createSecureContext(config)
    return config;
}