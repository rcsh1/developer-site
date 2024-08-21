const P = 2n ** 255n - 19n, N = 2n ** 252n + 27742317777372353535851937790883648493n,
    Gx = 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
    Gy = 0x6666666666666666666666666666666666666666666666666666666666666658n, CURVE = {
        a: -1n,
        d: 37095705934669439343138083508754565189542113879843219016388785533085940283555n,
        p: P,
        n: N,
        h: 8,
        Gx,
        Gy
    }, err = (e = "") => {
        throw new Error(e)
    }, str = e => "string" == typeof e,
    isu8 = e => e instanceof Uint8Array || null != e && "object" == typeof e && "Uint8Array" === e.constructor.name,
    au8 = (e, t) => !isu8(e) || "number" == typeof t && t > 0 && e.length !== t ? err("Uint8Array of valid length expected") : e,
    u8n = e => new Uint8Array(e), toU8 = (e, t) => au8(str(e) ? h2b(e) : u8n(au8(e)), t), mod = (e, t = P) => {
        let n = e % t;
        return n >= 0n ? n : t + n
    }, isPoint = e => e instanceof Point ? e : err("Point expected");

class Point {
    constructor(e, t, n, o) {
        this.ex = e, this.ey = t, this.ez = n, this.et = o
    }

    static fromAffine(e) {
        return new Point(e.x, e.y, 1n, mod(e.x * e.y))
    }

    static fromHex(e, t = !1) {
        const {d: n} = CURVE, o = (e = toU8(e, 32)).slice(), r = e[31];
        o[31] = -129 & r;
        const s = b2n_LE(o);
        !t || 0n <= s && s < 2n ** 256n || err("bad y coord 1"), t || 0n <= s && s < P || err("bad y coord 2");
        const i = mod(s * s), a = mod(i - 1n), d = mod(n * i + 1n);
        let {isValid: c, value: u} = uvRatio(a, d);
        c || err("bad y coordinate 3");
        const h = 1n === (1n & u), l = !!(128 & r);
        return !t && 0n === u && l && err("bad y coord 3"), l !== h && (u = mod(-u)), new Point(u, s, 1n, mod(u * s))
    }

    get x() {
        return this.toAffine().x
    }

    get y() {
        return this.toAffine().y
    }

    equals(e) {
        const {ex: t, ey: n, ez: o} = this, {ex: r, ey: s, ez: i} = isPoint(e), a = mod(t * i), d = mod(r * o),
            c = mod(n * i), u = mod(s * o);
        return a === d && c === u
    }

    is0() {
        return this.equals(I)
    }

    negate() {
        return new Point(mod(-this.ex), this.ey, this.ez, mod(-this.et))
    }

    double() {
        const {ex: e, ey: t, ez: n} = this, {a: o} = CURVE, r = mod(e * e), s = mod(t * t), i = mod(2n * mod(n * n)),
            a = mod(o * r), d = e + t, c = mod(mod(d * d) - r - s), u = a + s, h = u - i, l = a - s, y = mod(c * h),
            m = mod(u * l), f = mod(c * l), b = mod(h * u);
        return new Point(y, m, b, f)
    }

    add(e) {
        const {ex: t, ey: n, ez: o, et: r} = this, {ex: s, ey: i, ez: a, et: d} = isPoint(e), {a: c, d: u} = CURVE,
            h = mod(t * s), l = mod(n * i), y = mod(r * u * d), m = mod(o * a), f = mod((t + n) * (s + i) - h - l),
            b = mod(m - y), p = mod(m + y), P = mod(l - c * h), x = mod(f * b), g = mod(p * P), w = mod(f * P),
            _ = mod(b * p);
        return new Point(x, g, _, w)
    }

    mul(e, t = !0) {
        if (0n === e) return !0 === t ? err("cannot multiply by 0") : I;
        if ("bigint" == typeof e && 0n < e && e < N || err("invalid scalar, must be < L"), !t && this.is0() || 1n === e) return this;
        if (this.equals(G)) return wNAF(e).p;
        let n = I, o = G;
        for (let r = this; e > 0n; r = r.double(), e >>= 1n) 1n & e ? n = n.add(r) : t && (o = o.add(r));
        return n
    }

    multiply(e) {
        return this.mul(e)
    }

    clearCofactor() {
        return this.mul(BigInt(CURVE.h), !1)
    }

    isSmallOrder() {
        return this.clearCofactor().is0()
    }

    isTorsionFree() {
        let e = this.mul(N / 2n, !1).double();
        return e = e.add(this), e.is0()
    }

    toAffine() {
        const {ex: e, ey: t, ez: n} = this;
        if (this.equals(I)) return {x: 0n, y: 1n};
        const o = invert(n);
        return 1n !== mod(n * o) && err("invalid inverse"), {x: mod(e * o), y: mod(t * o)}
    }

    toRawBytes() {
        const {x: e, y: t} = this.toAffine(), n = n2b_32LE(t);
        return n[31] |= 1n & e ? 128 : 0, n
    }

    toHex() {
        return b2h(this.toRawBytes())
    }
}

Point.BASE = new Point(Gx, Gy, 1n, mod(Gx * Gy)), Point.ZERO = new Point(0n, 1n, 1n, 0n);
const {BASE: G, ZERO: I} = Point, padh = (e, t) => e.toString(16).padStart(t, "0"),
    b2h = e => Array.from(e).map((e => padh(e, 2))).join(""), h2b = e => {
        const t = e.length;
        (!str(e) || t % 2) && err("hex invalid 1");
        const n = u8n(t / 2);
        for (let t = 0; t < n.length; t++) {
            const o = 2 * t, r = e.slice(o, o + 2), s = Number.parseInt(r, 16);
            (Number.isNaN(s) || s < 0) && err("hex invalid 2"), n[t] = s
        }
        return n
    }, n2b_32LE = e => h2b(padh(e, 64)).reverse(), b2n_LE = e => BigInt("0x" + b2h(u8n(au8(e)).reverse())),
    concatB = (...e) => {
        const t = u8n(e.reduce(((e, t) => e + au8(t).length), 0));
        let n = 0;
        return e.forEach((e => {
            t.set(e, n), n += e.length
        })), t
    }, invert = (e, t = P) => {
        (0n === e || t <= 0n) && err("no inverse n=" + e + " mod=" + t);
        let n = mod(e, t), o = t, r = 0n, s = 1n, i = 1n, a = 0n;
        for (; 0n !== n;) {
            const e = o / n, t = o % n, d = r - i * e, c = s - a * e;
            o = n, n = t, r = i, s = a, i = d, a = c
        }
        return 1n === o ? mod(r, t) : err("no inverse")
    }, pow2 = (e, t) => {
        let n = e;
        for (; t-- > 0n;) n *= n, n %= P;
        return n
    }, pow_2_252_3 = e => {
        const t = e * e % P * e % P, n = pow2(t, 2n) * t % P, o = pow2(n, 1n) * e % P, r = pow2(o, 5n) * o % P,
            s = pow2(r, 10n) * r % P, i = pow2(s, 20n) * s % P, a = pow2(i, 40n) * i % P, d = pow2(a, 80n) * a % P,
            c = pow2(d, 80n) * a % P, u = pow2(c, 10n) * r % P;
        return {pow_p_5_8: pow2(u, 2n) * e % P, b2: t}
    }, RM1 = 19681161376707505956807079304988542015446066515923890162744021073123829784752n, uvRatio = (e, t) => {
        const n = mod(t * t * t), o = mod(n * n * t), r = pow_2_252_3(e * o).pow_p_5_8;
        let s = mod(e * n * r);
        const i = mod(t * s * s), a = s, d = mod(s * RM1), c = i === e, u = i === mod(-e), h = i === mod(-e * RM1);
        return c && (s = a), (u || h) && (s = d), 1n === (1n & mod(s)) && (s = mod(-s)), {isValid: c || u, value: s}
    }, modL_LE = e => mod(b2n_LE(e), N);
let _shaS;
const sha512a = (...e) => etc.sha512Async(...e),
    sha512s = (...e) => "function" == typeof _shaS ? _shaS(...e) : err("etc.sha512Sync not set"), hash2extK = e => {
        const t = e.slice(0, 32);
        t[0] &= 248, t[31] &= 127, t[31] |= 64;
        const n = e.slice(32, 64), o = modL_LE(t), r = G.mul(o), s = r.toRawBytes();
        return {head: t, prefix: n, scalar: o, point: r, pointBytes: s}
    }, getExtendedPublicKeyAsync = e => sha512a(toU8(e, 32)).then(hash2extK),
    getExtendedPublicKey = e => hash2extK(sha512s(toU8(e, 32))),
    getPublicKeyAsync = e => getExtendedPublicKeyAsync(e).then((e => e.pointBytes)),
    getPublicKey = e => getExtendedPublicKey(e).pointBytes;

function hashFinish(e, t) {
    return e ? sha512a(t.hashable).then(t.finish) : t.finish(sha512s(t.hashable))
}

const _sign = (e, t, n) => {
        const {pointBytes: o, scalar: r} = e, s = modL_LE(t), i = G.mul(s).toRawBytes();
        return {
            hashable: concatB(i, o, n), finish: e => {
                const t = mod(s + modL_LE(e) * r, N);
                return au8(concatB(i, n2b_32LE(t)), 64)
            }
        }
    }, signAsync = async (e, t) => {
        const n = toU8(e), o = await getExtendedPublicKeyAsync(t), r = await sha512a(o.prefix, n);
        return hashFinish(!0, _sign(o, r, n))
    }, sign = (e, t) => {
        const n = toU8(e), o = getExtendedPublicKey(t), r = sha512s(o.prefix, n);
        return hashFinish(!1, _sign(o, r, n))
    }, dvo = {zip215: !0}, _verify = (e, t, n, o = dvo) => {
        t = toU8(t), e = toU8(e, 64);
        const {zip215: r} = o;
        let s, i, a, d, c = new Uint8Array;
        try {
            s = Point.fromHex(n, r), i = Point.fromHex(e.slice(0, 32), r), a = b2n_LE(e.slice(32, 64)), d = G.mul(a, !1), c = concatB(i.toRawBytes(), s.toRawBytes(), t)
        } catch (e) {
        }
        return {
            hashable: c, finish: e => {
                if (null == d) return !1;
                if (!r && s.isSmallOrder()) return !1;
                const t = modL_LE(e);
                return i.add(s.mul(t, !1)).add(d.negate()).clearCofactor().is0()
            }
        }
    }, verifyAsync = async (e, t, n, o = dvo) => hashFinish(!0, _verify(e, t, n, o)),
    verify = (e, t, n, o = dvo) => hashFinish(!1, _verify(e, t, n, o)),
    cr = () => "object" == typeof globalThis && "crypto" in globalThis ? globalThis.crypto : void 0, etc = {
        bytesToHex: b2h, hexToBytes: h2b, concatBytes: concatB, mod, invert, randomBytes: (e = 32) => {
            const t = cr();
            return t && t.getRandomValues || err("crypto.getRandomValues must be defined"), t.getRandomValues(u8n(e))
        }, sha512Async: async (...e) => {
            const t = cr();
            t && t.subtle || err("crypto.subtle or etc.sha512Async must be defined");
            const n = concatB(...e);
            return u8n(await t.subtle.digest("SHA-512", n.buffer))
        }, sha512Sync: void 0
    };
Object.defineProperties(etc, {
    sha512Sync: {
        configurable: !1, get: () => _shaS, set(e) {
            _shaS || (_shaS = e)
        }
    }
});
const utils = {
    getExtendedPublicKeyAsync,
    getExtendedPublicKey,
    randomPrivateKey: () => etc.randomBytes(32),
    precompute: (e = 8, t = G) => (t.multiply(3n), t)
}, W = 8, precompute = () => {
    const e = [];
    let t = G, n = t;
    for (let o = 0; o < 33; o++) {
        n = t, e.push(n);
        for (let o = 1; o < 128; o++) n = n.add(t), e.push(n);
        t = n.double()
    }
    return e
};
let Gpows;
const wNAF = e => {
    const t = Gpows || (Gpows = precompute()), n = (e, t) => {
        let n = t.negate();
        return e ? n : t
    };
    let o = I, r = G;
    const s = BigInt(255), i = BigInt(8);
    for (let a = 0; a < 33; a++) {
        const d = 128 * a;
        let c = Number(e & s);
        e >>= i, c > 128 && (c -= 256, e += 1n);
        const u = d, h = d + Math.abs(c) - 1, l = a % 2 != 0, y = c < 0;
        0 === c ? r = r.add(n(l, t[u])) : o = o.add(n(y, t[h]))
    }
    return {p: o, f: r}
};
const crypto = require('crypto-js');
function hexToUint8Array(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const byteArray = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        byteArray[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return byteArray;
}
etc.sha512Sync = (...m) => {
    const concatenatedBytes = etc.concatBytes(...m);
    const wordArray = crypto.lib.WordArray.create(concatenatedBytes);
    const hash = crypto.SHA512(wordArray);
    ret = hash.toString(crypto.enc.Hex);
    return hexToUint8Array(ret)
};

function constructSignContent(request, nonce) {
    console.log(request.url.getPath(), request.url.host)
    const originalPath = request.url.getPath();
    const path = originalPath.startsWith("/v2") ? originalPath : "/v2" + originalPath;
    const method = request.method
    const body = (pm.request.body != null && pm.request.body.raw != null) ? pm.request.body.raw : '';
    let queryString = request.url.getQueryString()
    
    if (queryString != "") {
        const params = queryString.split('&').map(param => {
            const [key, value] = param.split('=');
            return { key: key, value: value };
        });

        queryString = params.map(param => {
            return `${param.key}=${encodeURIComponent(param.value)}`;
        }).join('&').replace(/%20/g, "+");
    }

    const strToSign = [method, path, nonce, queryString, body].join('|');
    console.log("strToSign:", strToSign)
    return crypto.SHA256(crypto.SHA256(strToSign)).toString();
}

const nonce = String(new Date().getTime());
const hash = constructSignContent(pm.request, nonce)

// get private key from environment
const privateKey = pm.environment.get('privateKey')
// sign the request
const sig = sign(hash, privateKey)
// add authorization headers
pm.request.addHeader(
    {
        key:'Biz-Api-Nonce',
        value: nonce
    }
)
pm.request.addHeader(
    {
        key:'Biz-Api-Signature',
        value: Buffer.from(sig).toString('hex')
    }
)
pm.request.addHeader(
    {
        key:'Biz-Api-Key',
        value: pm.environment.get('apiKey')
    }
)