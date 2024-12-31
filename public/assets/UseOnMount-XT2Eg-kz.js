var te = Object.defineProperty;
var ee = (e,t,n)=>t in e ? te(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: n
}) : e[t] = n;
var h = (e,t,n)=>(ee(e, typeof t != "symbol" ? t + "" : t, n),
n);
var z, c, Bt, Dt, P, St, Ft, ft, Ot, q = {}, Lt = [], ne = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, rt = Array.isArray;
function E(e, t) {
    for (var n in t)
        e[n] = t[n];
    return e
}
function It(e) {
    var t = e.parentNode;
    t && t.removeChild(e)
}
function ie(e, t, n) {
    var i, o, r, _ = {};
    for (r in t)
        r == "key" ? i = t[r] : r == "ref" ? o = t[r] : _[r] = t[r];
    if (arguments.length > 2 && (_.children = arguments.length > 3 ? z.call(arguments, 2) : n),
    typeof e == "function" && e.defaultProps != null)
        for (r in e.defaultProps)
            _[r] === void 0 && (_[r] = e.defaultProps[r]);
    return I(e, _, i, o, null)
}
function I(e, t, n, i, o) {
    var r = {
        type: e,
        props: t,
        key: n,
        ref: i,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: o ?? ++Bt,
        __i: -1,
        __u: 0
    };
    return o == null && c.vnode != null && c.vnode(r),
    r
}
function He() {
    return {
        current: null
    }
}
function st(e) {
    return e.children
}
function j(e, t) {
    this.props = e,
    this.context = t
}
function B(e, t) {
    if (t == null)
        return e.__ ? B(e.__, e.__i + 1) : null;
    for (var n; t < e.__k.length; t++)
        if ((n = e.__k[t]) != null && n.__e != null)
            return n.__e;
    return typeof e.type == "function" ? B(e) : null
}
function jt(e) {
    var t, n;
    if ((e = e.__) != null && e.__c != null) {
        for (e.__e = e.__c.base = null,
        t = 0; t < e.__k.length; t++)
            if ((n = e.__k[t]) != null && n.__e != null) {
                e.__e = e.__c.base = n.__e;
                break
            }
        return jt(e)
    }
}
function ht(e) {
    (!e.__d && (e.__d = !0) && P.push(e) && !nt.__r++ || St !== c.debounceRendering) && ((St = c.debounceRendering) || Ft)(nt)
}
function nt() {
    var e, t, n, i, o, r, _, a, u;
    for (P.sort(ft); e = P.shift(); )
        e.__d && (t = P.length,
        i = void 0,
        r = (o = (n = e).__v).__e,
        a = [],
        u = [],
        (_ = n.__P) && ((i = E({}, o)).__v = o.__v + 1,
        c.vnode && c.vnode(i),
        yt(_, i, o, n.__n, _.ownerSVGElement !== void 0, 32 & o.__u ? [r] : null, a, r ?? B(o), !!(32 & o.__u), u),
        i.__.__k[i.__i] = i,
        Gt(a, i, u),
        i.__e != r && jt(i)),
        P.length > t && P.sort(ft));
    nt.__r = 0
}
function Wt(e, t, n, i, o, r, _, a, u, l, p) {
    var s, d, f, m, C, b = i && i.__k || Lt, g = t.length;
    for (n.__d = u,
    oe(n, t, b),
    u = n.__d,
    s = 0; s < g; s++)
        (f = n.__k[s]) != null && typeof f != "boolean" && typeof f != "function" && (d = f.__i === -1 ? q : b[f.__i] || q,
        f.__i = s,
        yt(e, f, d, o, r, _, a, u, l, p),
        m = f.__e,
        f.ref && d.ref != f.ref && (d.ref && mt(d.ref, null, f),
        p.push(f.ref, f.__c || m, f)),
        C == null && m != null && (C = m),
        65536 & f.__u || d.__k === f.__k ? u = Vt(f, u, e) : typeof f.type == "function" && f.__d !== void 0 ? u = f.__d : m && (u = m.nextSibling),
        f.__d = void 0,
        f.__u &= -196609);
    n.__d = u,
    n.__e = C
}
function oe(e, t, n) {
    var i, o, r, _, a, u = t.length, l = n.length, p = l, s = 0;
    for (e.__k = [],
    i = 0; i < u; i++)
        (o = e.__k[i] = (o = t[i]) == null || typeof o == "boolean" || typeof o == "function" ? null : typeof o == "string" || typeof o == "number" || typeof o == "bigint" || o.constructor == String ? I(null, o, null, null, o) : rt(o) ? I(st, {
            children: o
        }, null, null, null) : o.constructor === void 0 && o.__b > 0 ? I(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : o) != null ? (o.__ = e,
        o.__b = e.__b + 1,
        a = se(o, n, _ = i + s, p),
        o.__i = a,
        r = null,
        a !== -1 && (p--,
        (r = n[a]) && (r.__u |= 131072)),
        r == null || r.__v === null ? (a == -1 && s--,
        typeof o.type != "function" && (o.__u |= 65536)) : a !== _ && (a === _ + 1 ? s++ : a > _ ? p > u - _ ? s += a - _ : s-- : s = a < _ && a == _ - 1 ? a - _ : 0,
        a !== i + s && (o.__u |= 65536))) : (r = n[i]) && r.key == null && r.__e && (r.__e == e.__d && (e.__d = B(r)),
        pt(r, r, !1),
        n[i] = null,
        p--);
    if (p)
        for (i = 0; i < l; i++)
            (r = n[i]) != null && !(131072 & r.__u) && (r.__e == e.__d && (e.__d = B(r)),
            pt(r, r))
}
function Vt(e, t, n) {
    var i, o;
    if (typeof e.type == "function") {
        for (i = e.__k,
        o = 0; i && o < i.length; o++)
            i[o] && (i[o].__ = e,
            t = Vt(i[o], t, n));
        return t
    }
    return e.__e != t && (n.insertBefore(e.__e, t || null),
    t = e.__e),
    t && t.nextSibling
}
function re(e, t) {
    return t = t || [],
    e == null || typeof e == "boolean" || (rt(e) ? e.some(function(n) {
        re(n, t)
    }) : t.push(e)),
    t
}
function se(e, t, n, i) {
    var o = e.key
      , r = e.type
      , _ = n - 1
      , a = n + 1
      , u = t[n];
    if (u === null || u && o == u.key && r === u.type)
        return n;
    if (i > (u != null && !(131072 & u.__u) ? 1 : 0))
        for (; _ >= 0 || a < t.length; ) {
            if (_ >= 0) {
                if ((u = t[_]) && !(131072 & u.__u) && o == u.key && r === u.type)
                    return _;
                _--
            }
            if (a < t.length) {
                if ((u = t[a]) && !(131072 & u.__u) && o == u.key && r === u.type)
                    return a;
                a++
            }
        }
    return -1
}
function Ct(e, t, n) {
    t[0] === "-" ? e.setProperty(t, n ?? "") : e[t] = n == null ? "" : typeof n != "number" || ne.test(t) ? n : n + "px"
}
function Q(e, t, n, i, o) {
    var r;
    t: if (t === "style")
        if (typeof n == "string")
            e.style.cssText = n;
        else {
            if (typeof i == "string" && (e.style.cssText = i = ""),
            i)
                for (t in i)
                    n && t in n || Ct(e.style, t, "");
            if (n)
                for (t in n)
                    i && n[t] === i[t] || Ct(e.style, t, n[t])
        }
    else if (t[0] === "o" && t[1] === "n")
        r = t !== (t = t.replace(/(PointerCapture)$|Capture$/, "$1")),
        t = t.toLowerCase()in e ? t.toLowerCase().slice(2) : t.slice(2),
        e.l || (e.l = {}),
        e.l[t + r] = n,
        n ? i ? n.u = i.u : (n.u = Date.now(),
        e.addEventListener(t, r ? Et : Tt, r)) : e.removeEventListener(t, r ? Et : Tt, r);
    else {
        if (o)
            t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if (t !== "width" && t !== "height" && t !== "href" && t !== "list" && t !== "form" && t !== "tabIndex" && t !== "download" && t !== "rowSpan" && t !== "colSpan" && t !== "role" && t in e)
            try {
                e[t] = n ?? "";
                break t
            } catch {}
        typeof n == "function" || (n == null || n === !1 && t[4] !== "-" ? e.removeAttribute(t) : e.setAttribute(t, n))
    }
}
function Tt(e) {
    var t = this.l[e.type + !1];
    if (e.t) {
        if (e.t <= t.u)
            return
    } else
        e.t = Date.now();
    return t(c.event ? c.event(e) : e)
}
function Et(e) {
    return this.l[e.type + !0](c.event ? c.event(e) : e)
}
function yt(e, t, n, i, o, r, _, a, u, l) {
    var p, s, d, f, m, C, b, g, k, U, J, L, xt, X, lt, $ = t.type;
    if (t.constructor !== void 0)
        return null;
    128 & n.__u && (u = !!(32 & n.__u),
    r = [a = t.__e = n.__e]),
    (p = c.__b) && p(t);
    t: if (typeof $ == "function")
        try {
            if (g = t.props,
            k = (p = $.contextType) && i[p.__c],
            U = p ? k ? k.props.value : p.__ : i,
            n.__c ? b = (s = t.__c = n.__c).__ = s.__E : ("prototype"in $ && $.prototype.render ? t.__c = s = new $(g,U) : (t.__c = s = new j(g,U),
            s.constructor = $,
            s.render = ae),
            k && k.sub(s),
            s.props = g,
            s.state || (s.state = {}),
            s.context = U,
            s.__n = i,
            d = s.__d = !0,
            s.__h = [],
            s._sb = []),
            s.__s == null && (s.__s = s.state),
            $.getDerivedStateFromProps != null && (s.__s == s.state && (s.__s = E({}, s.__s)),
            E(s.__s, $.getDerivedStateFromProps(g, s.__s))),
            f = s.props,
            m = s.state,
            s.__v = t,
            d)
                $.getDerivedStateFromProps == null && s.componentWillMount != null && s.componentWillMount(),
                s.componentDidMount != null && s.__h.push(s.componentDidMount);
            else {
                if ($.getDerivedStateFromProps == null && g !== f && s.componentWillReceiveProps != null && s.componentWillReceiveProps(g, U),
                !s.__e && (s.shouldComponentUpdate != null && s.shouldComponentUpdate(g, s.__s, U) === !1 || t.__v === n.__v)) {
                    for (t.__v !== n.__v && (s.props = g,
                    s.state = s.__s,
                    s.__d = !1),
                    t.__e = n.__e,
                    t.__k = n.__k,
                    t.__k.forEach(function(K) {
                        K && (K.__ = t)
                    }),
                    J = 0; J < s._sb.length; J++)
                        s.__h.push(s._sb[J]);
                    s._sb = [],
                    s.__h.length && _.push(s);
                    break t
                }
                s.componentWillUpdate != null && s.componentWillUpdate(g, s.__s, U),
                s.componentDidUpdate != null && s.__h.push(function() {
                    s.componentDidUpdate(f, m, C)
                })
            }
            if (s.context = U,
            s.props = g,
            s.__P = e,
            s.__e = !1,
            L = c.__r,
            xt = 0,
            "prototype"in $ && $.prototype.render) {
                for (s.state = s.__s,
                s.__d = !1,
                L && L(t),
                p = s.render(s.props, s.state, s.context),
                X = 0; X < s._sb.length; X++)
                    s.__h.push(s._sb[X]);
                s._sb = []
            } else
                do
                    s.__d = !1,
                    L && L(t),
                    p = s.render(s.props, s.state, s.context),
                    s.state = s.__s;
                while (s.__d && ++xt < 25);
            s.state = s.__s,
            s.getChildContext != null && (i = E(E({}, i), s.getChildContext())),
            d || s.getSnapshotBeforeUpdate == null || (C = s.getSnapshotBeforeUpdate(f, m)),
            Wt(e, rt(lt = p != null && p.type === st && p.key == null ? p.props.children : p) ? lt : [lt], t, n, i, o, r, _, a, u, l),
            s.base = t.__e,
            t.__u &= -161,
            s.__h.length && _.push(s),
            b && (s.__E = s.__ = null)
        } catch (K) {
            t.__v = null,
            u || r != null ? (t.__e = a,
            t.__u |= u ? 160 : 32,
            r[r.indexOf(a)] = null) : (t.__e = n.__e,
            t.__k = n.__k),
            c.__e(K, t, n)
        }
    else
        r == null && t.__v === n.__v ? (t.__k = n.__k,
        t.__e = n.__e) : t.__e = _e(n.__e, t, n, i, o, r, _, u, l);
    (p = c.diffed) && p(t)
}
function Gt(e, t, n) {
    t.__d = void 0;
    for (var i = 0; i < n.length; i++)
        mt(n[i], n[++i], n[++i]);
    c.__c && c.__c(t, e),
    e.some(function(o) {
        try {
            e = o.__h,
            o.__h = [],
            e.some(function(r) {
                r.call(o)
            })
        } catch (r) {
            c.__e(r, o.__v)
        }
    })
}
function _e(e, t, n, i, o, r, _, a, u) {
    var l, p, s, d, f, m, C, b = n.props, g = t.props, k = t.type;
    if (k === "svg" && (o = !0),
    r != null) {
        for (l = 0; l < r.length; l++)
            if ((f = r[l]) && "setAttribute"in f == !!k && (k ? f.localName === k : f.nodeType === 3)) {
                e = f,
                r[l] = null;
                break
            }
    }
    if (e == null) {
        if (k === null)
            return document.createTextNode(g);
        e = o ? document.createElementNS("http://www.w3.org/2000/svg", k) : document.createElement(k, g.is && g),
        r = null,
        a = !1
    }
    if (k === null)
        b === g || a && e.data === g || (e.data = g);
    else {
        if (r = r && z.call(e.childNodes),
        b = n.props || q,
        !a && r != null)
            for (b = {},
            l = 0; l < e.attributes.length; l++)
                b[(f = e.attributes[l]).name] = f.value;
        for (l in b)
            f = b[l],
            l == "children" || (l == "dangerouslySetInnerHTML" ? s = f : l === "key" || l in g || Q(e, l, null, f, o));
        for (l in g)
            f = g[l],
            l == "children" ? d = f : l == "dangerouslySetInnerHTML" ? p = f : l == "value" ? m = f : l == "checked" ? C = f : l === "key" || a && typeof f != "function" || b[l] === f || Q(e, l, f, b[l], o);
        if (p)
            a || s && (p.__html === s.__html || p.__html === e.innerHTML) || (e.innerHTML = p.__html),
            t.__k = [];
        else if (s && (e.innerHTML = ""),
        Wt(e, rt(d) ? d : [d], t, n, i, o && k !== "foreignObject", r, _, r ? r[0] : n.__k && B(n, 0), a, u),
        r != null)
            for (l = r.length; l--; )
                r[l] != null && It(r[l]);
        a || (l = "value",
        m !== void 0 && (m !== e[l] || k === "progress" && !m || k === "option" && m !== b[l]) && Q(e, l, m, b[l], !1),
        l = "checked",
        C !== void 0 && C !== e[l] && Q(e, l, C, b[l], !1))
    }
    return e
}
function mt(e, t, n) {
    try {
        typeof e == "function" ? e(t) : e.current = t
    } catch (i) {
        c.__e(i, n)
    }
}
function pt(e, t, n) {
    var i, o;
    if (c.unmount && c.unmount(e),
    (i = e.ref) && (i.current && i.current !== e.__e || mt(i, null, t)),
    (i = e.__c) != null) {
        if (i.componentWillUnmount)
            try {
                i.componentWillUnmount()
            } catch (r) {
                c.__e(r, t)
            }
        i.base = i.__P = null,
        e.__c = void 0
    }
    if (i = e.__k)
        for (o = 0; o < i.length; o++)
            i[o] && pt(i[o], t, n || typeof e.type != "function");
    n || e.__e == null || It(e.__e),
    e.__ = e.__e = e.__d = void 0
}
function ae(e, t, n) {
    return this.constructor(e, n)
}
function le(e, t, n) {
    var i, o, r, _;
    c.__ && c.__(e, t),
    o = (i = typeof n == "function") ? null : n && n.__k || t.__k,
    r = [],
    _ = [],
    yt(t, e = (!i && n || t).__k = ie(st, null, [e]), o || q, q, t.ownerSVGElement !== void 0, !i && n ? [n] : o ? null : t.firstChild ? z.call(t.childNodes) : null, r, !i && n ? n : o ? o.__e : t.firstChild, i, _),
    Gt(r, e, _)
}
function ue(e, t) {
    le(e, t, ue)
}
function Me(e, t, n) {
    var i, o, r, _, a = E({}, e.props);
    for (r in e.type && e.type.defaultProps && (_ = e.type.defaultProps),
    t)
        r == "key" ? i = t[r] : r == "ref" ? o = t[r] : a[r] = t[r] === void 0 && _ !== void 0 ? _[r] : t[r];
    return arguments.length > 2 && (a.children = arguments.length > 3 ? z.call(arguments, 2) : n),
    I(e.type, a, i || e.key, o || e.ref, null)
}
function Ne(e, t) {
    var n = {
        __c: t = "__cC" + Ot++,
        __: e,
        Consumer: function(i, o) {
            return i.children(o)
        },
        Provider: function(i) {
            var o, r;
            return this.getChildContext || (o = [],
            (r = {})[t] = this,
            this.getChildContext = function() {
                return r
            }
            ,
            this.shouldComponentUpdate = function(_) {
                this.props.value !== _.value && o.some(function(a) {
                    a.__e = !0,
                    ht(a)
                })
            }
            ,
            this.sub = function(_) {
                o.push(_);
                var a = _.componentWillUnmount;
                _.componentWillUnmount = function() {
                    o.splice(o.indexOf(_), 1),
                    a && a.call(_)
                }
            }
            ),
            i.children
        }
    };
    return n.Provider.__ = n.Consumer.contextType = n
}
z = Lt.slice,
c = {
    __e: function(e, t, n, i) {
        for (var o, r, _; t = t.__; )
            if ((o = t.__c) && !o.__)
                try {
                    if ((r = o.constructor) && r.getDerivedStateFromError != null && (o.setState(r.getDerivedStateFromError(e)),
                    _ = o.__d),
                    o.componentDidCatch != null && (o.componentDidCatch(e, i || {}),
                    _ = o.__d),
                    _)
                        return o.__E = o
                } catch (a) {
                    e = a
                }
        throw e
    }
},
Bt = 0,
Dt = function(e) {
    return e != null && e.constructor == null
}
,
j.prototype.setState = function(e, t) {
    var n;
    n = this.__s != null && this.__s !== this.state ? this.__s : this.__s = E({}, this.state),
    typeof e == "function" && (e = e(E({}, n), this.props)),
    e && E(n, e),
    e != null && this.__v && (t && this._sb.push(t),
    ht(this))
}
,
j.prototype.forceUpdate = function(e) {
    this.__v && (this.__e = !0,
    e && this.__h.push(e),
    ht(this))
}
,
j.prototype.render = st,
P = [],
Ft = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout,
ft = function(e, t) {
    return e.__v.__b - t.__v.__b
}
,
nt.__r = 0,
Ot = 0;
var S = (e=>(e.DEBUG = "debug",
e.INFO = "info",
e.WARN = "warn",
e.ERROR = "error",
e.FATAL = "fatal",
e))(S || {});
class W {
    static obfuscate(t) {
        return t.length <= 2 ? "*".repeat(16) : t.substring(0, 1) + "*".repeat(14) + t.substring(t.length - 1)
    }
    static getMessage(t) {
        if (typeof t == "string")
            return t;
        if (typeof t == "object" && t !== null) {
            const n = t.message;
            if (typeof n == "string")
                return n
        }
        return String(t)
    }
    static getOneLineStack(t) {
        return !(t instanceof Error) || !t.stack ? "nostack" : t.stack.replace(/\n+/g, "\\r")
    }
}
class ce {
    print(t) {
        const n = t.data ?? "";
        switch (t.level) {
        case S.DEBUG:
            console.debug(`[${t.tag}]`, t.msg, n);
            break;
        case S.INFO:
            console.info(`[${t.tag}]`, t.msg, n);
            break;
        case S.WARN:
            console.warn(`[${t.tag}]`, t.msg, n);
            break;
        case S.ERROR:
        case S.FATAL:
            console.error(`[${t.tag}]`, t.msg, n);
            break
        }
    }
}
const T = class T {
    constructor(t) {
        this.tag = t
    }
    debug(t, n) {
        T.formatter.print({
            level: S.DEBUG,
            tag: this.tag,
            msg: t,
            data: n
        })
    }
    info(t, n) {
        T.formatter.print({
            level: S.INFO,
            tag: this.tag,
            msg: t,
            data: n
        })
    }
    warn(t, n) {
        T.formatter.print({
            level: S.WARN,
            tag: this.tag,
            msg: t,
            data: n
        })
    }
    error(t, n) {
        n.err = W.getMessage(n.err),
        T.formatter.print({
            level: S.ERROR,
            tag: this.tag,
            msg: t,
            data: n
        })
    }
    fatal(t, n) {
        n.err = W.getMessage(n.err),
        T.formatter.print({
            level: S.FATAL,
            tag: this.tag,
            msg: t,
            data: n
        })
    }
    unhandledError(t, n) {
        console.error(n.err),
        T.formatter.print({
            level: S.ERROR,
            tag: this.tag,
            msg: t,
            data: {
                ...n,
                err: W.getMessage(n.err),
                stack: n.err instanceof Error ? n.err.stack : "nostack",
                unhandled: !0
            }
        })
    }
}
;
h(T, "formatter", new ce),
h(T, "disabled", !1),
h(T, "onelineStackTrace", !1);
let dt = T;
function Z(e, t) {
    if (e == null)
        throw new Error(t ?? "value_not_initialized");
    return e
}
const G = class G extends Error {
    constructor(n, i=0, o=null) {
        super(n);
        h(this, "status");
        h(this, "data");
        this.name = "ApiError",
        this.status = i,
        this.data = o,
        Object.setPrototypeOf(this, G.prototype)
    }
}
;
h(G, "network_error", "network_error"),
h(G, "parse_error", "parse_error");
let x = G;
class fe {
    constructor(t, n) {
        h(this, "_context");
        h(this, "_path");
        this._context = t,
        this._path = n
    }
    get path() {
        return this._path
    }
    makeUrl() {
        const t = `${this._context.baseUrl}${this.path}`;
        try {
            return new URL(t)
        } catch {
            throw new Error(`Invalid URL: "${t}"`)
        }
    }
    makeHeaders(t, n) {
        t === void 0 && (t = this._context.authToken);
        const i = {};
        return i["Content-Type"] = "application/json",
        t && (i.Authorization = `Bearer ${t}`),
        this._context.headers.forEach((o,r)=>i[r] = o),
        {
            ...i,
            ...n
        }
    }
    async get(t, n, i) {
        const o = this.makeUrl();
        if (this._context.log.debug("GET", {
            url: o.toString(),
            params: t
        }),
        t)
            for (const a of Object.keys(t))
                o.searchParams.set(a, String(t[a]));
        let r;
        try {
            r = await fetch(o, {
                method: "GET",
                headers: this.makeHeaders(n, i)
            })
        } catch (a) {
            const u = new x(W.getMessage(a),503);
            throw this._context.callErrorHandler(u),
            u
        }
        const _ = await this.fetchResponse(r);
        if (_ instanceof x)
            throw this._context.callErrorHandler(_),
            _;
        return _
    }
    async post(t, n, i) {
        const o = this.makeUrl();
        this._context.log.debug("POST", {
            url: o.toString(),
            params: t
        });
        const r = this.makeHeaders(n, i)
          , _ = JSON.stringify(t ?? {});
        let a;
        try {
            a = await fetch(o, {
                method: "POST",
                headers: r,
                body: _
            })
        } catch (l) {
            const p = new x(W.getMessage(l),503);
            throw this._context.callErrorHandler(p),
            p
        }
        const u = await this.fetchResponse(a);
        if (u instanceof x)
            throw this._context.callErrorHandler(u),
            u;
        return u
    }
    async fetchResponse(t) {
        let n;
        try {
            n = await t.text()
        } catch {
            return new x(x.network_error,503)
        }
        let i;
        try {
            i = JSON.parse(n)
        } catch {
            return this._context._printUnparsedResponse && this._context.log.warn(n),
            new x(x.parse_error,t.status)
        }
        if (!t.ok) {
            const o = i.message
              , r = typeof o == "string" ? o : String(o);
            return new x(r,t.status,i)
        }
        return i
    }
}
class he {
    constructor(t) {
        h(this, "log");
        h(this, "headers", new Map);
        h(this, "_baseUrl", "");
        h(this, "_authToken", "");
        h(this, "_errorHandler");
        h(this, "_printUnparsedResponse");
        this.log = new dt(t.tag)
    }
    callErrorHandler(t) {
        if (this._errorHandler)
            try {
                this._errorHandler(t)
            } catch (n) {
                console.error(n)
            }
    }
    get baseUrl() {
        const t = this._baseUrl;
        return typeof t == "string" ? t : t()
    }
    get authToken() {
        const t = this._authToken;
        return t ? typeof t == "string" ? t : t() : ""
    }
}
class Pe {
    constructor(t) {
        h(this, "_context", new he({
            tag: "tap_api"
        }));
        h(this, "root_getRoot", this.makeCall("/"));
        h(this, "root_getHealth", this.makeCall("/api/health"));
        h(this, "root_getStat", this.makeCall("/api/stat"));
        h(this, "account_login", this.makeCall("/api/login"));
        h(this, "account_tokenLogin", this.makeCall("/api/account/wallet_login"));
        h(this, "missions_joinMission", this.makeCall("/api/missions/join_mission"));
        h(this, "missions_finishMission", this.makeCall("/api/missions/finish_mission"));
        h(this, "missions_finishMissionItem", this.makeCall("/api/missions/finish_mission_item"));
        h(this, "wallet_getLoginToken", this.makeCall("/api/wallet/get_token"));
        h(this, "wallet_setSolanaWallet", this.makeCall("/api/wallet/set_solana_wallet"));
        h(this, "player_submitTaps", this.makeCall("/api/player/submit_taps"));
        h(this, "player_getPlayer", this.makeCall("/api/player/get_player"));
        h(this, "player_claimReward", this.makeCall("/api/player/claim_reward"));
        h(this, "player_upgrade", this.makeCall("/api/player/upgrade"));
        h(this, "player_applyBoost", this.makeCall("/api/player/apply_boost"));
        h(this, "player_getRefs", this.makeCall("/api/player/get_refs"));
        h(this, "player_sendInvite", this.makeCall("/api/player/send_invite"));
        this._context._baseUrl = t.baseUrl,
        this._context._authToken = t.authToken ?? "",
        this._context._errorHandler = t.errorHandler,
        this._context._printUnparsedResponse = t.printUnparsedResponse,
        this.setHeaders(t.headers ?? {})
    }
    setHeaders(t) {
        for (const [n,i] of Object.entries(t))
            this._context.headers.set(n, i)
    }
    get baseUrl() {
        return this._context.baseUrl
    }
    get headers() {
        return this._context.headers
    }
    makeCall(t) {
        return new fe(this._context,t)
    }
}
var H, v, ut, Ut, D = 0, qt = [], tt = [], Ht = c.__b, Mt = c.__r, Nt = c.diffed, Pt = c.__c, Rt = c.unmount;
function F(e, t) {
    c.__h && c.__h(v, e, D || t),
    D = 0;
    var n = v.__H || (v.__H = {
        __: [],
        __h: []
    });
    return e >= n.__.length && n.__.push({
        __V: tt
    }),
    n.__[e]
}
function Re(e) {
    return D = 1,
    pe(zt, e)
}
function pe(e, t, n) {
    var i = F(H++, 2);
    if (i.t = e,
    !i.__c && (i.__ = [n ? n(t) : zt(void 0, t), function(a) {
        var u = i.__N ? i.__N[0] : i.__[0]
          , l = i.t(u, a);
        u !== l && (i.__N = [l, i.__[1]],
        i.__c.setState({}))
    }
    ],
    i.__c = v,
    !v.u)) {
        var o = function(a, u, l) {
            if (!i.__c.__H)
                return !0;
            var p = i.__c.__H.__.filter(function(d) {
                return d.__c
            });
            if (p.every(function(d) {
                return !d.__N
            }))
                return !r || r.call(this, a, u, l);
            var s = !1;
            return p.forEach(function(d) {
                if (d.__N) {
                    var f = d.__[0];
                    d.__ = d.__N,
                    d.__N = void 0,
                    f !== d.__[0] && (s = !0)
                }
            }),
            !(!s && i.__c.props === a) && (!r || r.call(this, a, u, l))
        };
        v.u = !0;
        var r = v.shouldComponentUpdate
          , _ = v.componentWillUpdate;
        v.componentWillUpdate = function(a, u, l) {
            if (this.__e) {
                var p = r;
                r = void 0,
                o(a, u, l),
                r = p
            }
            _ && _.call(this, a, u, l)
        }
        ,
        v.shouldComponentUpdate = o
    }
    return i.__N || i.__
}
function de(e, t) {
    var n = F(H++, 3);
    !c.__s && bt(n.__H, t) && (n.__ = e,
    n.i = t,
    v.__H.__h.push(n))
}
function ve(e, t) {
    var n = F(H++, 4);
    !c.__s && bt(n.__H, t) && (n.__ = e,
    n.i = t,
    v.__h.push(n))
}
function ge(e) {
    return D = 5,
    _t(function() {
        return {
            current: e
        }
    }, [])
}
function Ae(e, t, n) {
    D = 6,
    ve(function() {
        return typeof e == "function" ? (e(t()),
        function() {
            return e(null)
        }
        ) : e ? (e.current = t(),
        function() {
            return e.current = null
        }
        ) : void 0
    }, n == null ? n : n.concat(e))
}
function _t(e, t) {
    var n = F(H++, 7);
    return bt(n.__H, t) ? (n.__V = e(),
    n.i = t,
    n.__h = e,
    n.__V) : n.__
}
function Be(e, t) {
    return D = 8,
    _t(function() {
        return e
    }, t)
}
function De(e) {
    var t = v.context[e.__c]
      , n = F(H++, 9);
    return n.c = e,
    t ? (n.__ == null && (n.__ = !0,
    t.sub(v)),
    t.props.value) : e.__
}
function Fe(e, t) {
    c.useDebugValue && c.useDebugValue(t ? t(e) : e)
}
function Oe() {
    var e = F(H++, 11);
    if (!e.__) {
        for (var t = v.__v; t !== null && !t.__m && t.__ !== null; )
            t = t.__;
        var n = t.__m || (t.__m = [0, 0]);
        e.__ = "P" + n[0] + "-" + n[1]++
    }
    return e.__
}
function ye() {
    for (var e; e = qt.shift(); )
        if (e.__P && e.__H)
            try {
                e.__H.__h.forEach(et),
                e.__H.__h.forEach(vt),
                e.__H.__h = []
            } catch (t) {
                e.__H.__h = [],
                c.__e(t, e.__v)
            }
}
c.__b = function(e) {
    v = null,
    Ht && Ht(e)
}
,
c.__r = function(e) {
    Mt && Mt(e),
    H = 0;
    var t = (v = e.__c).__H;
    t && (ut === v ? (t.__h = [],
    v.__h = [],
    t.__.forEach(function(n) {
        n.__N && (n.__ = n.__N),
        n.__V = tt,
        n.__N = n.i = void 0
    })) : (t.__h.forEach(et),
    t.__h.forEach(vt),
    t.__h = [],
    H = 0)),
    ut = v
}
,
c.diffed = function(e) {
    Nt && Nt(e);
    var t = e.__c;
    t && t.__H && (t.__H.__h.length && (qt.push(t) !== 1 && Ut === c.requestAnimationFrame || ((Ut = c.requestAnimationFrame) || me)(ye)),
    t.__H.__.forEach(function(n) {
        n.i && (n.__H = n.i),
        n.__V !== tt && (n.__ = n.__V),
        n.i = void 0,
        n.__V = tt
    })),
    ut = v = null
}
,
c.__c = function(e, t) {
    t.some(function(n) {
        try {
            n.__h.forEach(et),
            n.__h = n.__h.filter(function(i) {
                return !i.__ || vt(i)
            })
        } catch (i) {
            t.some(function(o) {
                o.__h && (o.__h = [])
            }),
            t = [],
            c.__e(i, n.__v)
        }
    }),
    Pt && Pt(e, t)
}
,
c.unmount = function(e) {
    Rt && Rt(e);
    var t, n = e.__c;
    n && n.__H && (n.__H.__.forEach(function(i) {
        try {
            et(i)
        } catch (o) {
            t = o
        }
    }),
    n.__H = void 0,
    t && c.__e(t, n.__v))
}
;
var At = typeof requestAnimationFrame == "function";
function me(e) {
    var t, n = function() {
        clearTimeout(i),
        At && cancelAnimationFrame(t),
        setTimeout(e)
    }, i = setTimeout(n, 100);
    At && (t = requestAnimationFrame(n))
}
function et(e) {
    var t = v
      , n = e.__c;
    typeof n == "function" && (e.__c = void 0,
    n()),
    v = t
}
function vt(e) {
    var t = v;
    e.__c = e.__(),
    v = t
}
function bt(e, t) {
    return !e || e.length !== t.length || t.some(function(n, i) {
        return n !== e[i]
    })
}
function zt(e, t) {
    return typeof t == "function" ? t(e) : t
}
function at() {
    throw new Error("Cycle detected")
}
var be = Symbol.for("preact-signals");
function kt() {
    if (R > 1)
        R--;
    else {
        for (var e, t = !1; V !== void 0; ) {
            var n = V;
            for (V = void 0,
            gt++; n !== void 0; ) {
                var i = n.o;
                if (n.o = void 0,
                n.f &= -3,
                !(8 & n.f) && Jt(n))
                    try {
                        n.c()
                    } catch (o) {
                        t || (e = o,
                        t = !0)
                    }
                n = i
            }
        }
        if (gt = 0,
        R--,
        t)
            throw e
    }
}
var y = void 0
  , V = void 0
  , R = 0
  , gt = 0
  , it = 0;
function Yt(e) {
    if (y !== void 0) {
        var t = e.n;
        if (t === void 0 || t.t !== y)
            return t = {
                i: 0,
                S: e,
                p: y.s,
                n: void 0,
                t: y,
                e: void 0,
                x: void 0,
                r: t
            },
            y.s !== void 0 && (y.s.n = t),
            y.s = t,
            e.n = t,
            32 & y.f && e.S(t),
            t;
        if (t.i === -1)
            return t.i = 0,
            t.n !== void 0 && (t.n.p = t.p,
            t.p !== void 0 && (t.p.n = t.n),
            t.p = y.s,
            t.n = void 0,
            y.s.n = t,
            y.s = t),
            t
    }
}
function w(e) {
    this.v = e,
    this.i = 0,
    this.n = void 0,
    this.t = void 0
}
w.prototype.brand = be;
w.prototype.h = function() {
    return !0
}
;
w.prototype.S = function(e) {
    this.t !== e && e.e === void 0 && (e.x = this.t,
    this.t !== void 0 && (this.t.e = e),
    this.t = e)
}
;
w.prototype.U = function(e) {
    if (this.t !== void 0) {
        var t = e.e
          , n = e.x;
        t !== void 0 && (t.x = n,
        e.e = void 0),
        n !== void 0 && (n.e = t,
        e.x = void 0),
        e === this.t && (this.t = n)
    }
}
;
w.prototype.subscribe = function(e) {
    var t = this;
    return $t(function() {
        var n = t.value
          , i = 32 & this.f;
        this.f &= -33;
        try {
            e(n)
        } finally {
            this.f |= i
        }
    })
}
;
w.prototype.valueOf = function() {
    return this.value
}
;
w.prototype.toString = function() {
    return this.value + ""
}
;
w.prototype.toJSON = function() {
    return this.value
}
;
w.prototype.peek = function() {
    return this.v
}
;
Object.defineProperty(w.prototype, "value", {
    get: function() {
        var e = Yt(this);
        return e !== void 0 && (e.i = this.i),
        this.v
    },
    set: function(e) {
        if (y instanceof M && function() {
            throw new Error("Computed cannot have side-effects")
        }(),
        e !== this.v) {
            gt > 100 && at(),
            this.v = e,
            this.i++,
            it++,
            R++;
            try {
                for (var t = this.t; t !== void 0; t = t.x)
                    t.t.N()
            } finally {
                kt()
            }
        }
    }
});
function A(e) {
    return new w(e)
}
function Jt(e) {
    for (var t = e.s; t !== void 0; t = t.n)
        if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i)
            return !0;
    return !1
}
function Xt(e) {
    for (var t = e.s; t !== void 0; t = t.n) {
        var n = t.S.n;
        if (n !== void 0 && (t.r = n),
        t.S.n = t,
        t.i = -1,
        t.n === void 0) {
            e.s = t;
            break
        }
    }
}
function Kt(e) {
    for (var t = e.s, n = void 0; t !== void 0; ) {
        var i = t.p;
        t.i === -1 ? (t.S.U(t),
        i !== void 0 && (i.n = t.n),
        t.n !== void 0 && (t.n.p = i)) : n = t,
        t.S.n = t.r,
        t.r !== void 0 && (t.r = void 0),
        t = i
    }
    e.s = n
}
function M(e) {
    w.call(this, void 0),
    this.x = e,
    this.s = void 0,
    this.g = it - 1,
    this.f = 4
}
(M.prototype = new w).h = function() {
    if (this.f &= -3,
    1 & this.f)
        return !1;
    if ((36 & this.f) == 32 || (this.f &= -5,
    this.g === it))
        return !0;
    if (this.g = it,
    this.f |= 1,
    this.i > 0 && !Jt(this))
        return this.f &= -2,
        !0;
    var e = y;
    try {
        Xt(this),
        y = this;
        var t = this.x();
        (16 & this.f || this.v !== t || this.i === 0) && (this.v = t,
        this.f &= -17,
        this.i++)
    } catch (n) {
        this.v = n,
        this.f |= 16,
        this.i++
    }
    return y = e,
    Kt(this),
    this.f &= -2,
    !0
}
;
M.prototype.S = function(e) {
    if (this.t === void 0) {
        this.f |= 36;
        for (var t = this.s; t !== void 0; t = t.n)
            t.S.S(t)
    }
    w.prototype.S.call(this, e)
}
;
M.prototype.U = function(e) {
    if (this.t !== void 0 && (w.prototype.U.call(this, e),
    this.t === void 0)) {
        this.f &= -33;
        for (var t = this.s; t !== void 0; t = t.n)
            t.S.U(t)
    }
}
;
M.prototype.N = function() {
    if (!(2 & this.f)) {
        this.f |= 6;
        for (var e = this.t; e !== void 0; e = e.x)
            e.t.N()
    }
}
;
M.prototype.peek = function() {
    if (this.h() || at(),
    16 & this.f)
        throw this.v;
    return this.v
}
;
Object.defineProperty(M.prototype, "value", {
    get: function() {
        1 & this.f && at();
        var e = Yt(this);
        if (this.h(),
        e !== void 0 && (e.i = this.i),
        16 & this.f)
            throw this.v;
        return this.v
    }
});
function ke(e) {
    return new M(e)
}
function Qt(e) {
    var t = e.u;
    if (e.u = void 0,
    typeof t == "function") {
        R++;
        var n = y;
        y = void 0;
        try {
            t()
        } catch (i) {
            throw e.f &= -2,
            e.f |= 8,
            wt(e),
            i
        } finally {
            y = n,
            kt()
        }
    }
}
function wt(e) {
    for (var t = e.s; t !== void 0; t = t.n)
        t.S.U(t);
    e.x = void 0,
    e.s = void 0,
    Qt(e)
}
function we(e) {
    if (y !== this)
        throw new Error("Out-of-order effect");
    Kt(this),
    y = e,
    this.f &= -2,
    8 & this.f && wt(this),
    kt()
}
function Y(e) {
    this.x = e,
    this.u = void 0,
    this.s = void 0,
    this.o = void 0,
    this.f = 32
}
Y.prototype.c = function() {
    var e = this.S();
    try {
        if (8 & this.f || this.x === void 0)
            return;
        var t = this.x();
        typeof t == "function" && (this.u = t)
    } finally {
        e()
    }
}
;
Y.prototype.S = function() {
    1 & this.f && at(),
    this.f |= 1,
    this.f &= -9,
    Qt(this),
    Xt(this),
    R++;
    var e = y;
    return y = this,
    we.bind(this, e)
}
;
Y.prototype.N = function() {
    2 & this.f || (this.f |= 2,
    this.o = V,
    V = this)
}
;
Y.prototype.d = function() {
    this.f |= 8,
    1 & this.f || wt(this)
}
;
function $t(e) {
    var t = new Y(e);
    try {
        t.c()
    } catch (n) {
        throw t.d(),
        n
    }
    return t.d.bind(t)
}
var ct;
function O(e, t) {
    c[e] = t.bind(null, c[e] || function() {}
    )
}
function ot(e) {
    ct && ct(),
    ct = e && e.S()
}
function Zt(e) {
    var t = this
      , n = e.data
      , i = xe(n);
    i.value = n;
    var o = _t(function() {
        for (var r = t.__v; r = r.__; )
            if (r.__c) {
                r.__c.__$f |= 4;
                break
            }
        return t.__$u.c = function() {
            var _;
            !Dt(o.peek()) && ((_ = t.base) == null ? void 0 : _.nodeType) === 3 ? t.base.data = o.peek() : (t.__$f |= 1,
            t.setState({}))
        }
        ,
        ke(function() {
            var _ = i.value.value;
            return _ === 0 ? 0 : _ === !0 ? "" : _ || ""
        })
    }, []);
    return o.value
}
Zt.displayName = "_st";
Object.defineProperties(w.prototype, {
    constructor: {
        configurable: !0,
        value: void 0
    },
    type: {
        configurable: !0,
        value: Zt
    },
    props: {
        configurable: !0,
        get: function() {
            return {
                data: this
            }
        }
    },
    __b: {
        configurable: !0,
        value: 1
    }
});
O("__b", function(e, t) {
    if (typeof t.type == "string") {
        var n, i = t.props;
        for (var o in i)
            if (o !== "children") {
                var r = i[o];
                r instanceof w && (n || (t.__np = n = {}),
                n[o] = r,
                i[o] = r.peek())
            }
    }
    e(t)
});
O("__r", function(e, t) {
    ot();
    var n, i = t.__c;
    i && (i.__$f &= -2,
    (n = i.__$u) === void 0 && (i.__$u = n = function(o) {
        var r;
        return $t(function() {
            r = this
        }),
        r.c = function() {
            i.__$f |= 1,
            i.setState({})
        }
        ,
        r
    }())),
    ot(n),
    e(t)
});
O("__e", function(e, t, n, i) {
    ot(),
    e(t, n, i)
});
O("diffed", function(e, t) {
    ot();
    var n;
    if (typeof t.type == "string" && (n = t.__e)) {
        var i = t.__np
          , o = t.props;
        if (i) {
            var r = n.U;
            if (r)
                for (var _ in r) {
                    var a = r[_];
                    a !== void 0 && !(_ in i) && (a.d(),
                    r[_] = void 0)
                }
            else
                n.U = r = {};
            for (var u in i) {
                var l = r[u]
                  , p = i[u];
                l === void 0 ? (l = $e(n, u, p, o),
                r[u] = l) : l.o(p, o)
            }
        }
    }
    e(t)
});
function $e(e, t, n, i) {
    var o = t in e && e.ownerSVGElement === void 0
      , r = A(n);
    return {
        o: function(_, a) {
            r.value = _,
            i = a
        },
        d: $t(function() {
            var _ = r.value.value;
            i[t] !== _ && (i[t] = _,
            o ? e[t] = _ : _ ? e.setAttribute(t, _) : e.removeAttribute(t))
        })
    }
}
O("unmount", function(e, t) {
    if (typeof t.type == "string") {
        var n = t.__e;
        if (n) {
            var i = n.U;
            if (i) {
                n.U = void 0;
                for (var o in i) {
                    var r = i[o];
                    r && r.d()
                }
            }
        }
    } else {
        var _ = t.__c;
        if (_) {
            var a = _.__$u;
            a && (_.__$u = void 0,
            a.d())
        }
    }
    e(t)
});
O("__h", function(e, t, n, i) {
    (i < 3 || i === 9) && (t.__$f |= 2),
    e(t, n, i)
});
j.prototype.shouldComponentUpdate = function(e, t) {
    var n = this.__$u;
    if (!(n && n.s !== void 0 || 4 & this.__$f) || 3 & this.__$f)
        return !0;
    for (var i in t)
        return !0;
    for (var o in e)
        if (o !== "__source" && e[o] !== this.props[o])
            return !0;
    for (var r in this.props)
        if (!(r in e))
            return !0;
    return !1
}
;
function xe(e) {
    return _t(function() {
        return A(e)
    }, [])
}
class Le {
    constructor(t, n) {
        h(this, "_conf");
        h(this, "_data");
        h(this, "_walletData", A(void 0));
        h(this, "_missions", A(void 0));
        h(this, "_activeMissions", A([]));
        this._conf = t,
        this.update(n)
    }
    get id() {
        return this._data.id
    }
    get walletData() {
        return this._walletData.value
    }
    update(t) {
        this._data = t,
        t.missions && (this._missions.value = t.missions,
        this._activeMissions.value = t.missions.active),
        t.wallet_data && (this._walletData.value = t.wallet_data)
    }
    get completedMissions() {
        var t, n;
        return ((n = (t = this._data) == null ? void 0 : t.missions) == null ? void 0 : n.completed) || []
    }
    get activeMisssons() {
        return this._activeMissions.value
    }
    get availableMissions() {
        return this._conf.missions.filter(t=>!this.isMissionCompleted(t.id))
    }
    get finishedMissions() {
        return this._conf.missions.filter(t=>this.isMissionCompleted(t.id))
    }
    getActiveMission(t) {
        return this.activeMisssons.find(n=>n.id === t)
    }
    canFinishMission(t) {
        const n = this.getActiveMission(t);
        return n !== void 0 && n.items.every(i=>i.verified)
    }
    isMissionCompleted(t) {
        return this.completedMissions.includes(t)
    }
}
class Ie {
    constructor(t) {
        h(this, "_data");
        this._data = t
    }
    get boosts() {
        return this._data.boosts
    }
    getEnergyLevel(t) {
        return Z(this.getEnergyLevelByNum(t))
    }
    getEnergyLevelByNum(t) {
        return this._data.energy_levels[t - 1]
    }
    getChargeLevel(t) {
        return Z(this.getChargeLevelByNum(t))
    }
    getChargeLevelByNum(t) {
        return this._data.charge_levels[t - 1]
    }
    getTapLevel(t) {
        return Z(this.getTapLevelByNum(t))
    }
    getTapLevelByNum(t) {
        return this._data.tap_levels[t - 1]
    }
    getLigue(t) {
        return Z(this.getLigueByNum(t))
    }
    getLigueByNum(t) {
        return this._data.ligues[t]
    }
    get ligues() {
        return this._data.ligues
    }
    get ref_rewards() {
        return this._data.ref_rewards
    }
    get tapBot() {
        return this._data.tap_bot
    }
    getNotificationByCategory(t, n) {
        return n > this._data.notifications[t].length - 1 && (n = this._data.notifications[t].length - 1),
        {
            ...this._data.notifications[t][n],
            category: t,
            index: n,
            id: `${t}${n}`
        }
    }
    getNotificationById(t) {
        const n = this.parseNotificationId(t);
        if (!n)
            throw new Error("cannot_parse_notification_id");
        return this.getNotificationByCategory(n.category, n.index)
    }
    parseNotificationId(t) {
        if (t.length < 3)
            return null;
        const n = t.substring(0, 2)
          , i = Number.parseInt(t.substring(2));
        return i >= 0 ? {
            category: n,
            index: i
        } : null
    }
    get missions() {
        return this._data.missions.map((t,n)=>({
            ...t,
            id: t.id || `M${n}`,
            items: t.items.map(i=>({
                ...i
            }))
        }))
    }
}
class je {
    constructor() {
        h(this, "openHandler", ()=>{}
        );
        h(this, "_messages", A([]))
    }
    info(...t) {
        console.info(t.join(" "));
        const n = {
            s: "I",
            m: t.join(" ")
        };
        this._messages.value = [...this._messages.value, n]
    }
    warn(...t) {
        console.warn(t.join(" "));
        const n = {
            s: "W",
            m: t.join(" ")
        };
        this._messages.value = [...this._messages.value, n]
    }
    error(...t) {
        const n = {
            s: "E",
            m: ""
        };
        for (const i of t)
            i instanceof x ? n.m += `${i.status} - ${i.message} ` : i instanceof Error ? n.e = i : n.m += String(i) + " ";
        console.error(n.s, n.m),
        this._messages.value = [...this._messages.value, n],
        this.openHandler()
    }
    open() {
        this.openHandler()
    }
    get messages() {
        return this._messages.value
    }
}
var Se = 0;
function N(e, t, n, i, o, r) {
    var _, a, u = {};
    for (a in t)
        a == "ref" ? _ = t[a] : u[a] = t[a];
    var l = {
        type: e,
        props: u,
        key: n,
        ref: _,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: --Se,
        __i: -1,
        __u: 0,
        __source: o,
        __self: r
    };
    if (typeof e == "function" && (_ = e.defaultProps))
        for (a in _)
            u[a] === void 0 && (u[a] = _[a]);
    return c.vnode && c.vnode(l),
    l
}
const We = {
    common: {
        from: "From",
        league_desc: "Your number of shares determines the league you enter."
    },
    button: {
        refferal: "Ref",
        task: "Task",
        boost: "Boost",
        invite: "Invite a friend",
        claim: "Claim",
        get_it: "Get it!",
        tap_tap: "Tap",
        stats: "Stats",
        start_mission: "Start mission",
        finish_mission: "Finish mission",
        check: "Check",
        submit: "Submit",
        go: "Go",
        open: "Open"
    },
    account: {
        your_balance: "Your Share balance"
    },
    task: {
        task_list: "Leagues:",
        ref_list: "Refer Tasks:",
        tabs: {
            leagues: "Leagues",
            ref_task: "Ref Tasks",
            missions: "Special"
        }
    },
    boost: {
        free_boost: "Your daily boosters:",
        boost: "Boosters:",
        level: "%value% level",
        current_level: "Current level:",
        upgrade_price: "Upgrade price:",
        max_upgrade_reached: "max upgrade reached:",
        insuffisient_funds: "insuffisient funds",
        free: "Free",
        energy: {
            title: "Full Tank",
            body: "Fill your energy to the max."
        },
        turbo: {
            title: "Taping Guru",
            body: "Multiply your tap income by x5 for 20 seconds. Do not use energy while active."
        },
        double: {
            title: "Doule",
            body: ""
        }
    },
    upgrades: {
        tap: {
            title: "Multitap",
            body1: "Increase amount of TAP you can earn per one tap.",
            body2: "+1 per tap for each level."
        },
        energy: {
            title: "Energy limit",
            body1: "Increase the limit of energy storage.",
            body2: "+500 energy limit for each level."
        },
        charge: {
            title: "Recharging speed",
            body1: "Increase speed of recharge",
            body2: "+1 per second."
        },
        tap_bot: {
            title: "Tap Bot",
            body1: "Tap bot will tap when your energy is full.",
            body2: "Max bot work duration is 12 hours."
        }
    },
    ref: {
        empty: "You don't have referrals 😭",
        ref_list: "My Referrals:",
        value_ref: "$value$ Referrals"
    },
    stat: {
        title: "Stats",
        total_t: "Total Touches:",
        total_b: "Total Share Balance:",
        total_p: "Total Players:",
        daily_p: "Daily Users:",
        online_p: "Online Players:"
    },
    tap_bot: {
        title: "Tap Bot",
        body: "While you were asleep, your Tap Bot earned some Shares for you ❤️"
    },
    leave: {
        text: "Leave the desktop. Mobile gaming rocks!"
    },
    notifications: {
        title: "Bonus!",
        messages: {
            NL0: "Hello, a welcome bonus of 100,000 coins has been prepared especially for you."
        }
    },
    missions: {
        reward: "Reward",
        your_task: "Your tasks",
        erroe_message: "Activity not confirmed. Are you certain you completed this task?",
        done: "Done!",
        conget: "Congratulations",
        congret_desc: "You've successfully completed the mission",
        completed: "Mission is completed!",
        solana_wallet: "Solana Wallet",
        instructions: {
            tg: "Join the Telegram chat",
            x: "Follow X handle",
            website: "Visit website",
            fb: "Follow Facebook page",
            yt: "Subscribe to the YouTube channel",
            ig: "Follow Instagram page",
            em: "Subscribe to the newsletter",
            discord: "Join Discord server"
        },
        individual_instrunctions: {
            M5: ["Shhh, 🤫 subscribe and be the first to know!", "Join for exclusive insider info!", "Join the channel so you won't miss out on the next gem!"],
            M6: ["Access to exclusive crypto insights!"],
            M7: ["Don't miss out on crypto insights – join now!"],
            M8: ["Don't miss out on crypto insights – join now!"]
        }
    },
    dashboard: {
        buttons: {
            sign_button: "Sign message",
            change_address: "Change address",
            back_to_app: "Back to mine"
        },
        header: "Welcome to DODO Coin dashboard",
        description: "Connect your wallet and sign the message to submit your Solana address to the DODO Coin application",
        solana_address: "Your confirmed solana address:"
    }
}
  , Ce = "_loadingContent_t1zxm_1"
  , Te = "_rotate_t1zxm_1"
  , Ee = {
    loadingContent: Ce,
    rotate: Te
}
  , Ve = ()=>N("div", {
    class: Ee.loadingContent,
    children: N("svg", {
        children: [N("defs", {
            children: N("linearGradient", {
                id: "gradient",
                x1: "0%",
                y1: "0%",
                x2: "0%",
                y2: "100%",
                children: [N("stop", {
                    offset: "0%",
                    "stop-color": "#2141ff"
                }), N("stop", {
                    offset: "100%",
                    "stop-color": "#287bcd"
                })]
            })
        }), N("circle", {
            cx: "-150",
            cy: "150",
            r: "137",
            stroke: "url(#gradient)",
            "stroke-width": "16",
            fill: "none",
            "stroke-linecap": "round",
            transform: "rotate(-90)"
        })]
    })
});
function Ge(e) {
    const t = ge(!1);
    de(()=>{
        if (!t.current)
            return t.current = !0,
            e()
    }
    , [])
}
export {re as $, je as A, ue as B, Me as E, Ne as F, Ie as G, We as L, $t as O, Pe as T, Oe as V, ge as _, A as a, Le as b, Z as c, Ge as d, Be as e, xe as f, st as g, Re as h, Ve as i, le as j, j as k, c as l, ve as m, Ae as n, _t as o, de as p, De as q, He as r, pe as s, N as u, Fe as x, ie as y};
//# sourceMappingURL=UseOnMount-XT2Eg-kz.js.map
