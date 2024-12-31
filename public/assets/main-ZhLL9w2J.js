var ot = Object.defineProperty;
var ct = (e, t, i) => t in e ? ot(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: i
}) : e[t] = i;
var o = (e, t, i) => (ct(e, typeof t != "symbol" ? t + "" : t, i),
    i);
import {
    a as L,
    F as lt,
    A as dt,
    T as ht,
    G as gt,
    b as ut,
    c as ne,
    u as n,
    q as m,
    L as c,
    h as y,
    d as B,
    p as Z,
    _ as Le,
    g as S,
    e as b,
    f as K,
    i as Te,
    O as pt,
    j as mt
} from "./UseOnMount-XT2Eg-kz.js";

const P = 1e3
    , de = 60 * P
    , he = 60 * de
    , ie = 24 * he
    , _t = new Date(864e13);

class vt {
    constructor() {
        o(this, "_frozenValue")
    }

    now() {
        return this._frozenValue ?? Date.now()
    }

    fromIsoDate(t) {
        return new Date(t).getTime()
    }

    cast(t) {
        return t % 1 === 0 ? t : Math.floor(t)
    }

    freeze(t) {
        return this._frozenValue = t ?? this.now(),
            this._frozenValue
    }

    unfreeze() {
        this._frozenValue = void 0
    }

    dropMillis(t) {
        return Math.floor(t / P) * P
    }

    addMillis(t, i) {
        return t + i
    }

    addSeconds(t, i) {
        return Math.round(t + i * P)
    }

    addMinutes(t, i) {
        return Math.round(t + i * de)
    }

    addHours(t, i) {
        return Math.round(t + i * he)
    }

    addDays(t, i) {
        return Math.round(t + i * ie)
    }

    toSeconds(t) {
        return t / P
    }

    toMinutes(t) {
        return t / de
    }

    toHours(t) {
        return t / he
    }

    toDays(t) {
        return t / ie
    }

    secondsNow() {
        return Math.floor(this.now() / P)
    }

    dateNow() {
        return new Date(this.now())
    }

    fromDate(t) {
        return t.getTime()
    }

    makeMeter() {
        return new yt
    }

    secondsToMillis(t) {
        return Math.floor(t * P)
    }

    minutesToMillis(t) {
        return Math.floor(t * de)
    }

    hoursToMillis(t) {
        return Math.floor(t * he)
    }

    daysToMillis(t) {
        return Math.floor(t * ie)
    }

    floorToDay(t) {
        return t - t % ie
    }

    get maxTime() {
        return _t.getTime()
    }

    get isFrozen() {
        return this._frozenValue !== void 0
    }
}

class yt {
    constructor() {
        o(this, "startTime", f.now())
    }

    get elapsed() {
        return f.now() - this.startTime
    }

    toString() {
        return `${this.elapsed / 1e3}s`
    }
}

const f = new vt;

function ft(e) {
    return new Promise(t => setTimeout(t, e))
}

class wt {
    constructor(t, i, s) {
        o(this, "_conf");
        o(this, "_taps", L(0));
        o(this, "_ligue", L(0));
        o(this, "_claims", L([]));
        o(this, "_boosts", L([]));
        o(this, "_boostActive", L(!1));
        o(this, "_data");
        o(this, "_lastTapAt", 0);
        o(this, "_usedEnergy", L(0));
        o(this, "_tappedBalance", 0);
        o(this, "_recoveredEnergyStack", 0);
        o(this, "_timeDifference", 0);
        this._conf = t,
        s > 0 && (this._tappedBalance = -s),
            this.update(i)
    }

    update(t) {
        this._data && t.time < this._data.time || (this._data = t,
            this._lastTapAt = t.time,
            this._ligue.value = t.ligue,
            this._claims.value = t.claims,
            this._timeDifference = f.now() - t.time,
            this._boosts.value = t.boost)
    }

    commitState(t, i, s) {
        this._taps.value -= t,
            this._usedEnergy.value -= s,
            this._tappedBalance -= i,
            this._recoveredEnergyStack = 0
    }

    applyTap() {
        this._tappedBalance += this.tapRate + this.currentBotEranings,
            this._recoveredEnergyStack += this.recoveredEnergy,
        this.getActiveBostByType("turbo") || (this._usedEnergy.value += this.currentTapLevel.energy),
            this._lastTapAt = f.addSeconds(this._lastTapAt, Math.floor((this.now - this._lastTapAt) / 1e3)),
            this._taps.value++
    }

    updateBoost(t) {
        this._boostActive.value = t
    }

    get id() {
        return this._data.id
    }

    get now() {
        return f.now() - this._timeDifference
    }

    get tapRate() {
        const t = this.getActiveBostByType("turbo");
        return this.currentTapLevel.rate * (t ? this._conf.boosts.turbo.rateMult : 1)
    }

    get currentBalance() {
        return this.shares + this._tappedBalance + this.currentBotEranings
    }

    get canTap() {
        return this.currentEnergy >= this.currentTapLevel.energy && !this.needClaimBotEarnings
    }

    get currentEnergy() {
        return this.energyLeft + this.recoveredEnergy
    }

    get currentEnergyPercent() {
        return this.currentEnergy / this.currentEnergyLevel.limit * 100
    }

    get energyLeft() {
        return Math.max(this._data.energy - this.usedEnergy + this._recoveredEnergyStack, 0)
    }

    get usedEnergy() {
        return this._usedEnergy.value
    }

    get recoveredEnergy() {
        const t = Math.max(this.currentEnergyLevel.limit - this.energyLeft, 0);
        return Math.min(t, this.recoveredEnergyByTime)
    }

    get recoveredEnergyByTime() {
        return Math.max(Math.floor((this.now - this.time) / 1e3) * this.currentChargeLevel.rate, 0)
    }

    get time() {
        return this._lastTapAt || this._data.time
    }

    get currentTapLevel() {
        return this._conf.getTapLevel(this.tapLevel)
    }

    get currentLigue() {
        return this._conf.getLigue(this.ligue)
    }

    get tapLevel() {
        return this._data.tap_level
    }

    get currentChargeLevel() {
        return this._conf.getChargeLevel(this.chargeLevel)
    }

    get chargeLevel() {
        return this._data.charge_level
    }

    get currentEnergyLevel() {
        return this._conf.getEnergyLevel(this.energyLevel)
    }

    get energyLevel() {
        return this._data.energy_level
    }

    get shares() {
        return this._data.shares ?? 0
    }

    get tappedBalance() {
        return this._tappedBalance
    }

    get taps() {
        return this._taps.value
    }

    get totalEarned() {
        return this.stat.earned + this._tappedBalance
    }

    get lastTapAt() {
        return this._lastTapAt
    }

    get claims() {
        return this._claims
    }

    get boost() {
        return this._boosts.value
    }

    getBoostByType(t) {
        return this.boost.find(i => i.type === t)
    }

    getActiveBostByType(t) {
        if (!this._boostActive.value)
            return;
        const i = this.getBoostByType(t);
        if (i && i.end > this.now)
            return i
    }

    get activeBoosts() {
        return this.boost.filter(t => t.end > this.now)
    }

    getClaimsByType(t) {
        return this._claims.value.filter(i => i[0] === t).map(i => parseInt(i.substring(1)))
    }

    get notificationClaim() {
        const t = this._claims.value.find(i => i[0] === "N");
        return t ? this._conf.getNotificationById(t) : void 0
    }

    get ligue() {
        return this._ligue.value
    }

    get haveTapBot() {
        return this._data.tap_bot
    }

    get stat() {
        return this._data.stat
    }

    get login_ts() {
        return this._data.login_ts
    }

    set login_ts(t) {
        this._data.login_ts = t
    }

    get needClaimBotEarnings() {
        return this.haveTapBot && this.climableBotEarnings > 0
    }

    get climableBotEarnings() {
        return this._tappedBalance >= 0 ? 0 : Math.abs(this._tappedBalance)
    }

    get currentBotEranings() {
        if (!this.haveTapBot || this.needClaimBotEarnings)
            return 0;
        const t = this._conf.tapBot.duration * this.currentTapLevel.rate;
        return Math.min(t, Math.max(this.energyLeft + this.recoveredEnergyByTime - this.currentEnergyLevel.limit, 0))
    }

    claimBotEarnings() {
        this.needClaimBotEarnings && (this._tappedBalance = 0)
    }

    static get emptyTO() {
        return {
            id: 0,
            time: 0,
            name: "",
            full_name: "",
            shares: 0,
            tokens: 0,
            ligue: 0,
            energy: 0,
            energy_level: 0,
            charge_level: 0,
            tap_level: 0,
            boost: [],
            boost_time: 0,
            claims: [],
            tap_bot: !1,
            login_ts: 0,
            stat: {
                earned: 0,
                taps: 0,
                ref_cnt: 0,
                ref_in: 0,
                ref_out: 0,
                reward: 0,
                spent: 0
            }
        }
    }
}

class bt {
    constructor() {
        o(this, "_history", []);
        o(this, "_page", L("taps"));
        window.addEventListener("keydown", e => {
                if (e.key === 'Backspace' || e.key === 'Escape')
                    this.back();
            }
        )
        window.back = this.back;
        Telegram.WebApp.onEvent("backButtonClicked", () => this.back())
    }

    back() {
        if (this._history.length === 0)
            return;
        const t = this._history.pop();
        t && t(),
        this._history.length === 0 && Telegram.WebApp.BackButton.hide()
    }

    init() {
        this._history = [],
            Telegram.WebApp.BackButton.hide()
    }

    regBackFunction(t) {
        Telegram.WebApp.BackButton.show(),
            this._history.push(t)
    }

    get page() {
        return this._page.value
    }

    clean() {
        this._history = [],
            Telegram.WebApp.BackButton.hide()
    }

    setPage(t) {
        this.clean(),
            this._page.value = t
    }

    setPageWithBack(t) {
        const i = this._page.value.toString();
        this.regBackFunction(() => this.setPage(i)),
            this._page.value = t
    }
}

class Ct {
    constructor() {
        o(this, "_message", L(""));
        o(this, "_type", L("info"))
    }

    start() {
        setTimeout(() => {
                this.close()
            }
            , 1e3)
    }

    showError(t) {
        this._message.value = t,
            this._type.value = "error",
            this.start()
    }

    showInfo(t) {
        this._message.value = t,
            this._type.value = "info",
            this.start()
    }

    close() {
        this._message.value = ""
    }

    get message() {
        return this._message.value
    }

    get type() {
        return this._type.value
    }
}

class Bt {
    constructor(t) {
        o(this, "_next_submit_time", 0);
        o(this, "_submission_in_progress", !1);
        o(this, "_started", !1);
        o(this, "_interval_time", 500);
        o(this, "_submitTry", 0);
        this.app = t
    }

    start() {
        this._started || (this._started = !0,
            this._next_submit_time = this.calcNextSubmitTime,
            this.runLoop().catch(console.error))
    }

    async runLoop() {
        for (; this._started;) {
            try {
                await this.loop()
            } catch (s) {
                console.error(s)
            }
            const t = this._interval_time * 2 ** this._submitTry
                , i = this.app.settings.submit_interval_s * 2 * 1e3;
            await ft(Math.min(t, i))
        }
    }

    async loop() {
        if (Date.parse(this.app.settings.start_date) >= this.app.player.now)
            return;
        const t = this.app.env === "dev" ? 120 : 3600
            , i = this.app.env === "dev" ? 10 : 300;
        if (this.app.player.login_ts + t * 1e3 - this.app.player.now <= i * 1e3)
            try {
                const _ = Object.fromEntries(new URLSearchParams(window.location.search).entries())
                    , d = await this.app.api.account_login.post(_);
                this.app.refreshLogin(d)
            } catch (_) {
                this._submitTry++,
                    this.app.log.error("login_failed", _);
                return
            }
        const a = this.app.player.now > this.calcIdleNextSubmitTime
            , r = this.app.player.now > this._next_submit_time
            , l = this.app.player.activeBoosts.sort((_, d) => _.end - d.end)[0]
            , g = l ? l.end - this.app.player.now < this._interval_time : !1;
        g && this.app.player.updateBoost(!1),
        (a || r || g) && (this._next_submit_time = this.calcNextSubmitTime,
            await this.submitTaps())
    }

    async submitTaps() {
        if (this.app.player.taps === 0 || this._submission_in_progress)
            return !1;
        let t = !1;
        this._submission_in_progress = !0;
        const i = this.app.player.taps
            , s = this.app.player.usedEnergy
            , a = this.app.player.tappedBalance
            , r = f.now()
            , l = {
            "Content-Id": this.hs(this.app.player.id, r).toString()
        };
        try {
            const g = await this.app.api.player_submitTaps.post({
                taps: i,
                time: r
            }, void 0, l);
            this.app.player.commitState(i, a, s),
                this.app.player.update(g.player),
                this._submitTry = 0,
                Telegram.WebApp.disableClosingConfirmation(),
                t = !0
        } catch (g) {
            this._submitTry++,
                this.app.log.error("player_submitTaps failed", g)
        }
        return this._submission_in_progress = !1,
            t
    }

    hs(t, i) {
        return t * i % t
    }

    get calcNextSubmitTime() {
        return f.addSeconds(f.now(), this.app.settings.submit_interval_s)
    }

    get calcIdleNextSubmitTime() {
        return f.addSeconds(this.app.player.lastTapAt || this._next_submit_time, 2)
    }
}

var At = {
    VITE_APP_BUILD_HASH: "300a043",
    VITE_APP_BUILD_DATE: "2024-05-02T16:02:23Z",
    VITE_APP_BUILD_NUM: "1",
    VITE_APP_ENV: "prod",
    VITE_APP_TITLE: "DODO Coin",
    VITE_APP_BACKEND_URL: window.BACKEND_URL,
    VITE_APP_BOT_NAME: "DODO Coin_bot",
    BASE_URL: "/",
    MODE: "prod",
    DEV: !1,
    PROD: !0,
    SSR: !1
};

class kt {
    constructor() {
        o(this, "env", "prod");
        o(this, "backendUrl", window.BACKEND_URL);
        o(this, "devInitData", At.VITE_APP_INIT_DATA);
        o(this, "log", new dt);
        o(this, "navService", new bt);
        o(this, "notification", new Ct);
        o(this, "api", new ht({
            baseUrl: this.backendUrl,
            authToken: () => this._authToken,
            errorHandler: t => this.onApiError(t),
            headers: {
                "x-app": "DODO Coin_server"
            }
        }));
        o(this, "tapsSubmitService", new Bt(this));
        o(this, "_botKey");
        o(this, "_authToken", "");
        o(this, "_gameConf");
        o(this, "_player");
        o(this, "_account");
        o(this, "_settings");
        o(this, "_debug_enabled", !1);
        this.log.info("[AppContext] buildHash: 300a043"),
            this.log.info("[AppContext] buildDate: 2024-05-02T16:02:23Z"),
            this.log.info("[AppContext] buildNum: 1"),
            this.log.info(`[AppContext] backendUrl: ${this.backendUrl}`),
            this.api.headers.set("x-cv", "1"),
            window.onerror = (i, s, a, r, l) => (l ? this.log.error(l) : (this.log.error(i),
                this.log.error(`source: ${s}`),
                this.log.error(`line: ${a}:${r}`)),
                !1)
    }

    onApiError(t) {
        t.status === 401 && location.reload()
    }

    initAppBot() {
        var t;
        try {
            const i = new URL(window.location.href)
                , s = i.searchParams.get("bot");
            this.log.info(`[AppContext] url: ${i.origin}${i.pathname}`),
                this.log.info(`[AppContext] bot: ${s}`),
            s !== null && (this._botKey = s)
        } catch (i) {
            this.log.error(i, (t = document == null ? void 0 : document.location) == null ? void 0 : t.search)
        }
    }

    login(t) {
        this._authToken = t.access_token,
            this._settings = t.settings,
            this._gameConf = new gt(t.conf),
            this._player = new wt(this._gameConf, t.player, t.bot_shares),
            this._account = new ut(this._gameConf, t.account),
            this._debug_enabled = t.debug_enabled,
            this.tapsSubmitService.start()
    }

    refreshLogin(t) {
        this._authToken = t.access_token,
        this._player && (this._player.login_ts = t.player.login_ts)
    }

    get gameConf() {
        return ne(this._gameConf)
    }

    get player() {
        return ne(this._player)
    }

    get account() {
        return ne(this._account)
    }

    get botKey() {
        return this._botKey
    }

    getInitData() {
        const search = new URLSearchParams(window.location.search);
        const t = Telegram.WebApp.initData || Object.fromEntries(search.entries());
        if (t)
            return this.log.info("[AppContext] using telegram init_data"),
                this.log.info(t),
                t;
        if (this.env !== "prod" && this.devInitData)
            return this.log.warn("[AppContext] using dev init_data"),
                this.log.info(this.devInitData),
                this.devInitData;
        const i = window.localStorage.getItem("init_data");
        return this.env !== "prod" && i ? (this.log.info("[AppContext] using storage init_data"),
            this.log.info(i),
            i) : (this.log.error("[AppContext] init_data not found"),
            "")
    }

    getLoginParams() {
        const t = this.getInitData();
        if (!t)
            return;
        const i = t;
        return this.botKey && (i.bot_key = this.botKey),
            i
    }

    get debugEnabled() {
        return this._debug_enabled === !0
    }

    get settings() {
        return ne(this._settings)
    }
}

const Qe = new kt
    , p = lt(Qe)
    , St = "_container_1pi1b_1"
    , xt = "_main_1pi1b_26"
    , Lt = "_page_1pi1b_45"
    , Tt = "_loading_1pi1b_50"
    , It = "_animationLayer_1pi1b_55"
    , $ = {
        container: St,
        main: xt,
        page: Lt,
        loading: Tt,
        animationLayer: It
    }
    ,
    Et = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M12%204C13.0506%204%2014.0909%204.20693%2015.0615%204.60896C16.0321%205.011%2016.914%205.60028%2017.6569%206.34315C18.3997%207.08601%2018.989%207.96793%2019.391%208.93853C19.7931%209.90914%2020%2010.9494%2020%2012C20%2013.0506%2019.7931%2014.0909%2019.391%2015.0615C18.989%2016.0321%2018.3997%2016.914%2017.6569%2017.6569C16.914%2018.3997%2016.0321%2018.989%2015.0615%2019.391C14.0909%2019.7931%2013.0506%2020%2012%2020C9.87827%2020%207.84344%2019.1571%206.34315%2017.6569C4.84285%2016.1566%204%2014.1217%204%2012C4%209.87827%204.84285%207.84344%206.34315%206.34315C7.84344%204.84285%209.87827%204%2012%204ZM14.8267%209.552L11%2013.3893L9.13867%2011.528C9.07668%2011.466%209.0031%2011.4168%208.92211%2011.3833C8.84113%2011.3498%208.75433%2011.3325%208.66667%2011.3325C8.57901%2011.3325%208.49221%2011.3498%208.41122%2011.3833C8.33024%2011.4168%208.25665%2011.466%208.19467%2011.528C8.13268%2011.59%208.08351%2011.6636%208.04997%2011.7446C8.01642%2011.8255%207.99916%2011.9123%207.99916%2012C7.99916%2012.0877%208.01642%2012.1745%208.04997%2012.2554C8.08351%2012.3364%208.13268%2012.41%208.19467%2012.472L10.528%2014.8053C10.5899%2014.8674%2010.6635%2014.9167%2010.7445%2014.9503C10.8255%2014.9839%2010.9123%2015.0012%2011%2015.0012C11.0877%2015.0012%2011.1745%2014.9839%2011.2555%2014.9503C11.3365%2014.9167%2011.4101%2014.8674%2011.472%2014.8053L15.7707%2010.4933C15.8919%2010.3674%2015.9589%2010.1989%2015.9571%2010.0241C15.9554%209.84932%2015.885%209.68221%2015.7613%209.55877C15.6375%209.43534%2015.4702%209.36546%2015.2953%209.36419C15.1205%209.36293%2014.9522%209.43037%2014.8267%209.552Z'%20fill='%2328E0B9'/%3e%3c/svg%3e"
    ,
    Mt = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M19.7714%2017.3067L13.5253%205.91654C13.3692%205.63749%2013.1464%205.40611%2012.8789%205.24534C12.6114%205.08458%2012.3086%205%2012.0004%205C11.6922%205%2011.3893%205.08458%2011.1218%205.24534C10.8543%205.40611%2010.6315%205.63749%2010.4754%205.91654L4.22933%2017.3067C4.07915%2017.5766%204%2017.8836%204%2018.1962C4%2018.5088%204.07915%2018.8158%204.22933%2019.0857C4.38341%2019.3664%204.60586%2019.599%204.87384%2019.7597C5.14182%2019.9204%205.44568%2020.0033%205.75425%2019.9999H18.2465C18.5548%2020.003%2018.8584%2019.92%2019.1261%2019.7593C19.3938%2019.5987%2019.616%2019.3662%2019.77%2019.0857C19.9204%2018.8159%2019.9997%2018.509%2020%2018.1964C20.0003%2017.8838%2019.9214%2017.5767%2019.7714%2017.3067ZM11.429%2011C11.429%2010.8409%2011.4892%2010.6883%2011.5963%2010.5757C11.7035%2010.4632%2011.8488%2010.4%2012.0004%2010.4C12.1519%2010.4%2012.2972%2010.4632%2012.4044%2010.5757C12.5116%2010.6883%2012.5718%2010.8409%2012.5718%2011V14C12.5718%2014.1591%2012.5116%2014.3117%2012.4044%2014.4242C12.2972%2014.5367%2012.1519%2014.6%2012.0004%2014.6C11.8488%2014.6%2011.7035%2014.5367%2011.5963%2014.4242C11.4892%2014.3117%2011.429%2014.1591%2011.429%2014V11ZM12.0004%2017.5999C11.8308%2017.5999%2011.6651%2017.5471%2011.5242%2017.4482C11.3832%2017.3494%2011.2734%2017.2088%2011.2085%2017.0443C11.1436%2016.8799%2011.1267%2016.6989%2011.1597%2016.5244C11.1928%2016.3498%2011.2744%2016.1894%2011.3943%2016.0635C11.5142%2015.9377%2011.6669%2015.852%2011.8331%2015.8172C11.9994%2015.7825%2012.1717%2015.8003%2012.3284%2015.8685C12.485%2015.9366%2012.6188%2016.0519%2012.713%2016.1999C12.8072%2016.3479%2012.8575%2016.5219%2012.8575%2016.6999C12.8575%2016.9386%2012.7672%2017.1675%2012.6064%2017.3363C12.4457%2017.5051%2012.2277%2017.5999%2012.0004%2017.5999Z'%20fill='%23D22929'/%3e%3c/svg%3e"
    , Dt = "_h5_7nyj0_1"
    , Pt = {
        h5: Dt
    }
    , z = e => n("h5", {
        class: Pt.h5,
        children: e.children
    })
    , zt = "_notificationContainer_1rfgf_1"
    , Vt = "_content_1rfgf_9"
    , Ht = "_info_1rfgf_24"
    , Nt = "_error_1rfgf_28"
    , ge = {
        notificationContainer: zt,
        content: Vt,
        info: Ht,
        error: Nt
    }
    , Wt = {
        info: ge.info,
        error: ge.error
    }
    , Rt = {
        info: Et,
        error: Mt
    }
    , jt = () => {
        const e = m(p);
        return n("div", {
            class: ge.notificationContainer,
            style: {
                bottom: `${e.notification.message ? "0" : "-120px"}`
            },
            onClick: () => e.notification.close(),
            children: n("div", {
                class: `${ge.content} ${Wt[e.notification.type]}`,
                children: [n("img", {
                    src: Rt[e.notification.type],
                    alt: e.notification.message
                }), n(z, {
                    children: e.notification.message
                })]
            })
        })
    }
    , Ot = {
        main: $.main,
        page: $.page,
        loading: $.loading
    }
    , A = ({page: e = "page", ...t}) => n("div", {
        class: `${$.container} ${Ot[e]}`,
        children: [n(jt, {}), t.children]
    })
    , Xt = "/assets/QR Code-yXKXdErT.png"
    , Gt = "_h6_7nyeu_1"
    , Ut = {
        h6: Gt
    }
    , J = e => n("h6", {
        class: Ut.h6,
        children: e.children
    })
    , Ft = "_leaveContainer_rxbn1_1"
    , qt = {
        leaveContainer: Ft
    }
    , Yt = () => n("div", {
        class: qt.leaveContainer,
        children: [n(J, {
            children: c.leave.text
        }), n("img", {
            src: Xt,
            alt: "QR Code"
        })]
    })
    , Qt = "_logPanel_menck_1"
    , $t = "_logContainer_menck_15"
    , Zt = "_logButtons_menck_31"
    , Kt = "_logBtn_menck_38"
    , Jt = "_logLine_menck_42"
    , en = "_logInfo_menck_46"
    , tn = "_logError_menck_50"
    , nn = "_logWarn_menck_54"
    , sn = "_logButton_menck_31"
    , w = {
        logPanel: Qt,
        logContainer: $t,
        logButtons: Zt,
        logBtn: Kt,
        logLine: Jt,
        logInfo: en,
        logError: tn,
        logWarn: nn,
        logButton: sn
    };

function Ne() {
    const e = m(p)
        , [t, i] = y(!1)
        , [s, a] = y(!1);
    B(() => {
            e.log.openHandler = () => i(!0)
        }
    ),
        Z(() => {
                t && r.current && (r.current.scrollTop = r.current.scrollHeight)
            }
        );
    const r = Le(null);
    if (!t)
        return n("button", {
            class: w.logButton,
            onClick: () => i(!0),
            children: "L"
        });
    const l = e.log.messages;
    return n(S, {
        children: [n("div", {
            class: w.logContainer,
            contenteditable: "true",
            spellcheck: !1,
            ref: r,
            style: {
                pointerEvents: s ? "auto" : "none"
            },
            children: [n("p", {
                style: {
                    marginBottom: 40
                }
            }), l.map(g => n(an, {
                msg: g
            })), n("p", {
                style: {
                    marginBottom: 100
                }
            })]
        }), n("div", {
            class: w.logButtons,
            children: [n("button", {
                class: w.logBtn,
                onClick: () => a(!s),
                children: "Selection"
            }), n("button", {
                class: w.logBtn,
                onClick: () => {
                    var g;
                    navigator.clipboard.writeText(((g = r.current) == null ? void 0 : g.innerText) ?? "").catch(_ => console.error(_))
                }
                ,
                children: "Copy"
            }), n("button", {
                class: w.logBtn,
                onClick: () => i(!1),
                children: "X"
            })]
        })]
    })
}

function an(e) {
    let t = `${w.logLine} ${w.logInfo}`
        , i = "I";
    return e.msg.s === "W" ? (t = `${w.logLine} ${w.logWarn}`,
        i = "I") : e.msg.s === "E" && (t = `${w.logLine} ${w.logError}`,
        i = "E"),
        n(S, {
            children: [e.msg.m && n("p", {
                class: t,
                children: [i, " ", e.msg.m]
            }), e.msg.e && n(S, {
                children: [n("p", {
                    class: t,
                    children: e.msg.e.message
                }), n("p", {
                    class: t,
                    children: e.msg.e.stack
                })]
            })]
        })
}

const Ie = "/assets/bot-einB6Dq0.png"
    , R = "/assets/coin-V6MfJmsH.png";

function Ee(e, t = 3) {
    if (e < 5e6)
        return C(e);
    const s = [{
        suffix: " T",
        threshold: 1e12
    }, {
        suffix: " B",
        threshold: 1e9
    }, {
        suffix: " M",
        threshold: 1e6
    }, {
        suffix: " K",
        threshold: 1e3
    }, {
        suffix: "",
        threshold: 1
    }].find(a => Math.abs(e) >= a.threshold);
    return s ? (e / s.threshold).toFixed(t) + s.suffix : e
}

function C(e) {
    const t = e.toString().split(".");
    return t[0] = t[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        t.join(".")
}

function rn(e) {
    const t = Math.floor(e / 1e3)
        , i = Math.floor(t / 60)
        , s = Math.floor(i / 60)
        , a = Math.floor(s / 24);
    return [a, s - a * 24, i - s * 60, t - i * 60]
}

function Me(e) {
    const [t, i, s, a] = rn(e);
    return t > 0 ? `${t}d ${i}h ${s}m ${a}s` : i > 0 ? `${i}h ${s}m ${a}s` : s > 0 ? `${s}m ${a}s` : `${a}s`
}

const on = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M19%206.41L17.59%205L12%2010.59L6.41%205L5%206.41L10.59%2012L5%2017.59L6.41%2019L12%2013.41L17.59%2019L19%2017.59L13.41%2012L19%206.41Z'%20fill='white'/%3e%3c/svg%3e"
    , cn = "_button_tohc5_1"
    , ln = "_primary_tohc5_12"
    , dn = "_secondary_tohc5_20"
    , hn = "_fullWidth_tohc5_28"
    , gn = "_small_tohc5_32"
    , un = "_large_tohc5_40"
    , W = {
        button: cn,
        primary: ln,
        secondary: dn,
        fullWidth: hn,
        small: gn,
        large: un
    }
    , pn = {
        primary: W.primary,
        secondary: W.secondary
    }
    , mn = {
        small: W.small,
        large: W.large
    }
    , x = ({variant: e = "primary", size: t = "large", ...i}) => {
        let s = `${W.button} ${pn[e]} ${mn[t]}`;
        const [a, r] = y(!1);
        i.fullWidth && (s += ` ${W.fullWidth}`);
        const l = async () => {
                r(!0),
                    await i.onClick(),
                    r(!1)
            }
        ;
        return n("button", {
            class: s,
            disabled: i.disabled || a,
            onClick: () => {
                l().catch(console.error)
            }
            ,
            children: i.children
        })
    }
    , _n = "_drowerContainer_17rzo_1"
    , vn = "_droewrHeader_17rzo_19"
    , yn = "_drowerContent_17rzo_26"
    , ve = {
        drowerContainer: _n,
        droewrHeader: vn,
        drowerContent: yn
    }
    , fn = "_imageContainer_12vh8_1"
    , wn = {
        imageContainer: fn
    }
    , De = e => n("div", {
        class: wn.imageContainer,
        children: n("img", {
            src: e.img,
            alt: e.alt
        })
    })
    , ee = e => {
        const t = Le(null);
        B(() => {
                t.current && (t.current.style.bottom = "0")
            }
        );
        const i = b(a => {
                t.current && (t.current.style.bottom = "-526px"),
                    setTimeout(() => e.onClose(a), 250)
            }
            , [e])
            , s = b(async () => {
                await e.onAction(),
                    i(!0)
            }
            , [i, e.onAction]);
        return n("div", {
            ref: t,
            class: ve.drowerContainer,
            children: [n("div", {
                class: ve.droewrHeader,
                children: n("div", {
                    onClick: () => i(!1),
                    children: n(De, {
                        img: on,
                        alt: "close"
                    })
                })
            }), n("div", {
                class: ve.drowerContent,
                children: e.children
            }), e.onAction && n(x, {
                variant: e.btnVariant,
                fullWidth: !0,
                onClick: s,
                children: e.btnText
            })]
        })
    }
    , bn = "_body1_ytgu1_1"
    , Cn = {
        body1: bn
    }
    , I = e => n("p", {
        class: Cn.body1,
        children: e.children
    })
    , Bn = "_h2_y7bjm_1"
    , An = {
        h2: Bn
    }
    , j = e => n("h2", {
        class: An.h2,
        children: e.children
    })
    , kn = "_h3_1a2e0_1"
    , Sn = {
        h3: kn
    }
    , V = e => n("h3", {
        class: Sn.h3,
        children: e.children
    })
    , xn = "_image_1yc2s_1"
    , Ln = "_price_1yc2s_13"
    , Tn = "_drowerAction_1yc2s_26"
    , In = "_text_1yc2s_33"
    , se = {
        image: xn,
        price: Ln,
        drowerAction: Tn,
        text: In
    }
    , En = () => {
        const e = m(p)
            , t = () => {
                e.player.claimBotEarnings()
            }
        ;
        return n(ee, {
            onAction: t,
            onClose: t,
            btnVariant: "secondary",
            btnText: c.button.get_it,
            children: [n("div", {
                class: se.image,
                children: n("img", {
                    src: Ie,
                    alt: "bot_earnings"
                })
            }), n("div", {
                class: se.drowerAction,
                children: [n("div", {
                    class: se.text,
                    children: [n(j, {
                        children: c.tap_bot.title
                    }), n("div", {
                        children: n(I, {
                            children: c.tap_bot.body
                        })
                    })]
                }), n("div", {
                    class: se.price,
                    children: [n("img", {
                        src: R,
                        alt: "coin"
                    }), n(V, {
                        children: C(e.player.climableBotEarnings)
                    })]
                })]
            })]
        })
    }
    , Mn = "_image_1yc2s_1"
    , Dn = "_price_1yc2s_13"
    , Pn = "_drowerAction_1yc2s_26"
    , zn = "_text_1yc2s_33"
    , ae = {
        image: Mn,
        price: Dn,
        drowerAction: Pn,
        text: zn
    }
    , Vn = e => {
        const t = m(p)
            , i = b(async () => {
                try {
                    const s = await t.api.player_claimReward.post({
                        task_id: e.notification.id
                    });
                    t.player.update(s.player),
                        t.notification.showInfo("Done!")
                } catch (s) {
                    t.log.error("player_claimReward", s),
                        t.notification.showError("Error!")
                }
            }
            , [t.api.player_claimReward, t.log, t.notification, t.player, e.notification.id]);
        return n(ee, {
            onAction: i,
            onClose: e.onClose,
            btnVariant: "secondary",
            btnText: c.button.get_it,
            children: [n("div", {
                class: ae.image,
                children: n("img", {
                    src: Ie,
                    alt: "bot_earnings"
                })
            }), n("div", {
                class: ae.drowerAction,
                children: [n("div", {
                    class: ae.text,
                    children: [n(j, {
                        children: c.notifications.title
                    }), n("div", {
                        children: n(I, {
                            children: c.notifications.messages[e.notification.id]
                        })
                    })]
                }), n("div", {
                    class: ae.price,
                    children: [n("img", {
                        src: R,
                        alt: "coin"
                    }), n(V, {
                        children: C(e.notification.reward)
                    })]
                })]
            })]
        })
    }
;

function Hn() {
    const e = Telegram.WebApp.platform;
    return e === "android" || e === "ios"
}

function Se(e) {
    document.body.style.overflow = e ? "hidden" : "auto",
        document.body.style.marginTop = e ? "100px" : "0",
        document.body.style.height = e ? window.innerHeight + 100 + "px" : "100vh",
        window.scrollTo(0, e ? 100 : 0)
}

const ue = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAMAAADxPgR5AAAC91BMVEUAAADWm0bdpk7FjDvZqVPUnkLbpEveqU3gqk/twmv+7MDjrFHZnknepUzjrVL97sfbo0nlsFPYoUz97cbksFbepkv97cX76bb54avkrVSndijjrFLrumL87sbdpUzfp07LkD/97snmr1L57LnXlELVmEb978vepkvhq1DnslT+78v97cTZokmpdSjepkuzfC/msFbRlEPhrE/ltl3luF3WnkXvyH/VmEP978qwfC3514/ZoUjlr1LXnETLjTzfrFrVmEOnciX86sD87snGjj7215XgqU7kr1DmslWrdin75a7wxGrfp03NkED436zZoUeocyiueCutdiroslLntVfGizr21JDntl7Ahzb21Iz968L846ruyID204v74qT10Yv86bj74KGveCz00Yn43J7978ntv2bIizzRkkKZZx7xxGzsvGTPkEDEiTn97sfvwWj0yG/erVXQkUG/hTbzxm3wwmrChjjJjT798Mv31Ifnt2Ddo0zQlkXUlUTSlETNkkLKjj+7gjS3fjH86r3ltl3hsVjXmkbVl0X97cTqu2LTmUfQl0DGiTugbSOWZR2RYRvquGHhrFfbqVHMl0PHjzy+gzWdaiHjtFveqFTcplLYnEinciebaCD87MH2ynHWnUvQnEbHkkDOjz/Njj68hjejbyb757bVoEvankrLkUHCjDyvdyv86bn857L85a300ILpuV/Zpk7fp03YoU3Tm0KpdCn636DmvW/dsGDmslzjrlnTm0vNlD7Lkjy0fTGxeS6LXBf52ZD514vpvGXaokfWn0XBiDq3gTS0ey/846j74aP73pvxzIHzzXzksFrZo1Daok/Wo0zboEq5gDGsdSqmcCaVYx373Zf625TwyXvjt2XSoVPTn0jNmUbTlEPHjTnCiTa7fzOxey3sxnjuxnLpwXLhqU+teSyGWRbxynXos13hqVPVmkiNXhj03q/WplPVkkGAVRTiuXrZpWHu0qHoxo/dr27Qn0rrzJjoxpDkvYDfr2vaplyhb1YtAAAAZXRSTlMADBchBxEtImr+Hv7t4bOpg310c11HOykX/v7a0Mq/lIyKNhD+9fHw5uTf29vOpqKYmFVJJ/fq6ung2dDJsbGmnW9lW0P79/X07+3r0srJxruxjoSAeWtU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"
    ,
    Nn = "data:image/png;base64,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"
    , Wn = "/assets/multitap-wNXfII5N.png"
    , $e = "/assets/turbo-3TsFcQmE.png"
    , Rn = {
        energy: Nn,
        charge: ue,
        tap: Wn,
        tap_bot: Ie
    }
    , jn = {
        energy: ue,
        turbo: $e,
        double: ue
    };

function Y(e) {
    return Rn[e]
}

function xe(e) {
    return jn[e]
}

const On = "_image_1yc2s_1"
    , Xn = "_price_1yc2s_13"
    , Gn = "_drowerAction_1yc2s_26"
    , Un = "_text_1yc2s_33"
    , re = {
    image: On,
    price: Xn,
    drowerAction: Gn,
    text: Un
}
    , Fn = e => {
    const t = m(p);
    return n(ee, {
        onAction: async () => {
            try {
                await t.tapsSubmitService.submitTaps();
                const a = await t.api.player_applyBoost.post({
                    type: e.type
                });
                t.player.updateBoost(!0),
                    t.player.update(a.player),
                    t.notification.showInfo("Good!"),
                    t.navService.setPage("taps")
            } catch (a) {
                t.log.error("player_applyBoost failed", a),
                    t.notification.showError("Error!")
            }
        }
        ,
        onClose: a => {
            e.onClose(),
            a && t.navService.back()
        }
        ,
        btnText: c.button.get_it,
        btnVariant: "secondary",
        children: [n("div", {
            class: re.image,
            children: n("img", {
                src: xe(e.type),
                alt: e.type
            })
        }), n("div", {
            class: re.drowerAction,
            children: [n("div", {
                class: re.text,
                children: [n(j, {
                    children: c.boost[e.type].title
                }), n("div", {
                    children: n(I, {
                        children: c.boost[e.type].body
                    })
                })]
            }), n("div", {
                class: re.price,
                children: [n("img", {
                    src: R,
                    alt: "coin"
                }), n(V, {
                    children: c.boost.free
                })]
            })]
        })]
    })
}
    , pe = "/assets/coin_ico-0IEzdR8j.png"
    , qn = "_h1_tffsq_1"
    , Yn = {
    h1: qn
}
    , Qn = e => n("h1", {
    class: Yn.h1,
    children: e.children
})
    , $n = "_wrapper_vzbpl_1"
    , Zn = {
    wrapper: $n
}
    , Ze = e => n("div", {
    class: Zn.wrapper,
    children: [n("img", {
        id: "main_balance_coin",
        src: pe,
        alt: "coin image"
    }), n(Qn, {
        children: Ee(e.value)
    })]
});

function Ke() {
    const e = m(p)
        , t = K(e.player.currentBalance);
    return B(() => {
            const s = setInterval(() => {
                    const a = e.player.currentBalance;
                    if (t.value !== a)
                        if (a > t.value) {
                            const r = Math.max(1, Math.floor((a - t.value) * .2));
                            t.value = Math.min(t.value + r, a)
                        } else {
                            const r = Math.max(1, Math.floor((t.value - a) * .2));
                            t.value = Math.max(t.value - r, a)
                        }
                }
                , 50);
            return () => clearInterval(s)
        }
    ),
        n(Ze, {
            value: t.value
        })
}

const Kn = "_balanceBoxContainer_2ucgd_1"
    , Jn = {
        balanceBoxContainer: Kn
    }
    , Je = e => n("div", {
        class: Jn.balanceBoxContainer,
        children: [n(I, {
            children: e.text
        }), e.children]
    })
    , ei = "_body2_nxvid_1"
    , ti = {
        body2: ei
    }
    , T = e => n("p", {
        class: ti.body2,
        children: e.children
    })
    , ni = "_boostButton_1iowv_1"
    , ii = "_info_1iowv_35"
    , We = {
        boostButton: ni,
        info: ii
    }
    , Re = e => {
        const t = () => {
            const s = Math.max(Math.floor(864e5 - f.now() % 864e5), 0);
            return Me(s)
        }
            , i = K(e.value > 0 ? `${e.value}/3` : t());
        return B(() => {
                if (e.value === 0) {
                    const s = setInterval(() => {
                            i.value = t()
                        }
                        , 1e3);
                    return () => clearInterval(s)
                }
            }
        ),
            n("button", {
                class: We.boostButton,
                onClick: e.onClick,
                disabled: e.disabled,
                children: [n("img", {
                    src: e.img,
                    alt: e.title
                }), n("div", {
                    class: We.info,
                    children: [n(z, {
                        children: e.title
                    }), n(T, {
                        children: i
                    })]
                })]
            })
    }
    , si = "_bottomContent_1uv7x_1"
    , ai = "_bottomBackdown_1uv7x_10"
    , je = {
        bottomContent: si,
        bottomBackdown: ai
    }
    , E = e => n(S, {
        children: [e.compensator && n("div", {
            class: je.bottomBackdown
        }), n("div", {
            class: je.bottomContent,
            children: e.children
        })]
    })
    , ri = "_container_1rd9h_1"
    , oi = {
        container: ri
    }
    , O = e => n("div", {
        class: oi.container,
        children: e.children
    })
    , ci = "_hr_15ort_1"
    , li = {
        hr: ci
    }
    , me = () => n("div", {
        class: li.hr
    })
    , di = "_listContainer_1519s_1"
    , hi = {
        listContainer: di
    }
    , te = e => n("div", {
        class: hi.listContainer,
        onScroll: t => {
            Se(t.currentTarget.scrollTop > 0)
        }
        ,
        children: e.children
    })
    ,
    gi = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M8.79502%2015.875L4.62502%2011.705L3.20502%2013.115L8.79502%2018.705L20.795%206.705L19.385%205.295L8.79502%2015.875Z'%20fill='%2328E0B9'/%3e%3c/svg%3e"
    ,
    Pe = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M9.70498%206L8.29498%207.41L12.875%2012L8.29498%2016.59L9.70498%2018L15.705%2012L9.70498%206Z'%20fill='white'/%3e%3c/svg%3e"
    , ui = "_listItem_1icg4_1"
    , pi = "_reward_1icg4_21"
    , mi = "_navigationBox_1icg4_25"
    , ye = {
        listItem: ui,
        reward: pi,
        navigationBox: mi
    }
    , _i = "/assets/bronze-0SrHDjVD.png"
    , vi = "/assets/diamond-4mnGiedh.png"
    , yi = "/assets/elite-nANXQnD-.png"
    , fi = "/assets/gold-mRqjLoGb.png"
    , wi = "/assets/grandmaster-1xEYe6w5.png"
    , bi = "/assets/legendary-46Gnapio.png"
    , Ci = "/assets/master-P0UrC1Yj.png"
    , Bi = "/assets/mythic-Ygh-hMOM.png"
    , Ai = "/assets/platinum-QbjQJTtd.png"
    , ki = "/assets/silver-3twj9DXt.png"
    , Si = "/assets/wooden-Piwu07tH.png"
    ,
    xi = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster", "elite", "legendary", "mythic"]
    , Li = [Si, _i, ki, fi, Ai, vi, Ci, wi, yi, bi, Bi];

function _e(e) {
    return Li[xi.indexOf(e.toLowerCase())]
}

const Ti = "_needAction_15xal_1"
    , Ii = {
        needAction: Ti
    }
    , et = e => n("div", {
        class: `${e.needAction ? Ii.needAction : ""}`
    })
    , Ei = "_infoContainer_1shkw_1"
    , Mi = "_avatar_1shkw_6"
    , Di = "_text_1shkw_12"
    , Pi = "_name_1shkw_19"
    , zi = "_balance_1shkw_26"
    , Vi = "_priceLevel_1shkw_36"
    , Hi = "_hr_1shkw_42"
    , Ni = "_level_1shkw_48"
    , Wi = "_ligue_1shkw_52"
    , k = {
        infoContainer: Ei,
        avatar: Mi,
        text: Di,
        name: Pi,
        balance: zi,
        priceLevel: Vi,
        hr: Hi,
        level: Ni,
        ligue: Wi
    }
    , ze = e => n("div", {
        class: k.infoContainer,
        children: [e.img && n("div", {
            class: k.avatar,
            children: [n(et, {
                needAction: e.needAction
            }), n("img", {
                src: e.img
            })]
        }), n("div", {
            class: k.text,
            children: [n("div", {
                class: k.name,
                children: n(z, {
                    children: e.name
                })
            }), n("div", {
                class: k.priceLevel,
                children: [e.ligue !== void 0 && n("div", {
                    class: k.ligue,
                    children: [n("div", {
                        children: n("img", {
                            src: _e(e.ligue.name)
                        })
                    }), n(T, {
                        children: e.ligue.name
                    })]
                }), e.ligue !== void 0 && e.balance !== void 0 && n("div", {
                    class: k.hr
                }), e.balance !== void 0 && n("div", {
                    class: k.balance,
                    children: [n("img", {
                        src: pe,
                        alt: "coin"
                    }), n(T, {
                        children: C(e.balance)
                    })]
                }), e.level !== void 0 && e.balance !== void 0 && n("div", {
                    class: k.hr
                }), e.level && n("div", {
                    class: k.level,
                    children: n(T, {
                        children: c.boost.level.replace("%value%", e.level.toString())
                    })
                })]
            })]
        })]
    })
    , Q = e => n("button", {
        class: `${ye.listItem}`,
        disabled: e.disabled,
        onClick: e.onClick,
        children: [n(ze, {
            img: e.img,
            name: e.name,
            balance: e.balance,
            level: e.level,
            needAction: e.needAction
        }), n("div", {
            class: ye.navigationBox,
            children: [e.reward !== void 0 && n("div", {
                class: ye.reward,
                children: n(J, {
                    children: ["+", Ee(e.reward, 0)]
                })
            }), !e.completed && !e.disabled && n("img", {
                src: Pe,
                alt: "right chevron"
            }), e.completed && n("img", {
                src: gi,
                alt: "check icon"
            })]
        })]
    })
    , Ri = "_h4_1w1my_1"
    , ji = {
        h4: Ri
    }
    , D = e => n("h4", {
        class: ji.h4,
        children: e.children
    })
    , Oi = "_stack_sem72_1"
    , Xi = {
        stack: Oi
    }
    , Gi = e => n("div", {
        class: Xi.stack,
        children: [n(D, {
            children: e.title
        }), e.children]
    })
    , tt = "/assets/refferal-bs9HxsZk.png"
    ,
    Ui = "data:image/png;base64,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"
    , Fi = "/assets/task-DyhGDW8C.png"
    , qi = "_button_1dzm3_1"
    , Yi = "_imageContainer_1dzm3_28"
    , Qi = "_active_1dzm3_34"
    , fe = {
        button: qi,
        imageContainer: Yi,
        active: Qi
    }
    , X = e => n("button", {
        className: `${fe.button} ${e.active && fe.active}`,
        disabled: e.disabled,
        onClick: e.onClick,
        children: [n("div", {
            class: fe.imageContainer,
            children: [n(et, {
                needAction: e.needAction
            }), n("img", {
                src: e.icon,
                alt: "navigation button"
            })]
        }), e.text]
    })
    , $i = "_wrapper_1c0ec_1"
    , Zi = {
        wrapper: $i
    }
    , Ki = e => n("div", {
        class: Zi.wrapper,
        children: e.children
    })
    , M = () => {
        const e = m(p);
        return n(Ki, {
            children: [n(X, {
                icon: tt,
                text: c.button.refferal,
                onClick: () => e.navService.setPage("ref"),
                active: e.navService.page === "ref"
            }), n(X, {
                icon: pe,
                text: c.button.tap_tap,
                onClick: () => e.navService.setPage("taps"),
                active: e.navService.page === "taps"
            }), n(X, {
                icon: $e,
                text: c.button.boost,
                onClick: () => e.navService.setPage("boost"),
                active: e.navService.page === "boost"
            })]
        })
    }
    , Ji = "_boostBtnRow_vghyc_1"
    , es = "_container_vghyc_6"
    , Oe = {
        boostBtnRow: Ji,
        container: es
    }
    , ts = e => {
        const t = m(p)
            , i = t.gameConf.getTapLevelByNum(t.player.tapLevel + 1)
            , s = t.gameConf.getChargeLevelByNum(t.player.chargeLevel + 1)
            , a = t.gameConf.getEnergyLevelByNum(t.player.energyLevel + 1)
            , r = t.player.getBoostByType("turbo")
            , l = t.player.getBoostByType("energy")
            , g = t.player.activeBoosts;
        return n(O, {
            children: [n(Je, {
                text: c.account.your_balance,
                children: n(Ke, {})
            }), n(me, {}), n(Gi, {
                title: c.boost.free_boost,
                children: n("div", {
                    class: Oe.boostBtnRow,
                    children: [n(Re, {
                        img: xe("turbo"),
                        title: c.boost.turbo.title,
                        value: (r == null ? void 0 : r.cnt) || 0,
                        disabled: r && r.cnt === 0 || g.length > 0,
                        onClick: () => e.onOpenBoostPopup("turbo")
                    }), n(Re, {
                        img: xe("energy"),
                        title: c.boost.energy.title,
                        value: (l == null ? void 0 : l.cnt) || 0,
                        disabled: l && l.cnt === 0 || g.length > 0,
                        onClick: () => e.onOpenBoostPopup("energy")
                    })]
                })
            }), n("div", {
                class: Oe.container,
                children: [n(D, {
                    children: c.boost.boost
                }), n(te, {
                    children: [n(Q, {
                        name: c.upgrades.tap.title,
                        img: Y("tap"),
                        balance: i == null ? void 0 : i.price,
                        level: t.player.tapLevel,
                        disabled: i === void 0,
                        onClick: () => e.onOpenPopUp("tap", i.price, t.player.tapLevel + 1)
                    }), n(Q, {
                        name: c.upgrades.energy.title,
                        img: Y("energy"),
                        balance: a == null ? void 0 : a.price,
                        level: t.player.energyLevel,
                        disabled: a === void 0,
                        onClick: () => e.onOpenPopUp("energy", a.price, t.player.energyLevel + 1)
                    }), n(Q, {
                        name: c.upgrades.charge.title,
                        img: Y("charge"),
                        balance: s == null ? void 0 : s.price,
                        level: t.player.chargeLevel,
                        disabled: s === void 0,
                        onClick: () => e.onOpenPopUp("charge", s.price, t.player.chargeLevel + 1)
                    }), n(Q, {
                        name: c.upgrades.tap_bot.title,
                        img: Y("tap_bot"),
                        balance: t.gameConf.tapBot.price,
                        disabled: t.player.haveTapBot,
                        onClick: () => e.onOpenPopUp("tap_bot", t.gameConf.tapBot.price, 0)
                    })]
                })]
            }), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        })
    }
    , ns = "_image_19lh0_1"
    , is = "_price_19lh0_13"
    , ss = "_drowerAction_19lh0_23"
    , as = "_text_19lh0_30"
    , rs = "_desc_19lh0_40"
    , G = {
        image: ns,
        price: is,
        drowerAction: ss,
        text: as,
        desc: rs
    }
    , os = e => {
        const t = m(p)
            , i = async () => {
                try {
                    await t.tapsSubmitService.submitTaps();
                    const s = await t.api.player_upgrade.post({
                        type: e.type
                    });
                    t.player.update(s.player),
                        t.notification.showInfo("Good!")
                } catch (s) {
                    t.log.error("player_upgrade failed", s),
                        t.notification.showError("Error!")
                }
            }
        ;
        return n(ee, {
            onAction: t.player.currentBalance < e.price ? void 0 : i,
            onClose: e.onClose,
            btnVariant: "secondary",
            btnText: c.button.get_it,
            children: [n("div", {
                class: G.image,
                children: n("img", {
                    src: Y(e.type),
                    alt: e.type
                })
            }), n("div", {
                class: G.drowerAction,
                children: [n("div", {
                    class: G.text,
                    children: [n(j, {
                        children: c.upgrades[e.type].title
                    }), n("div", {
                        class: G.desc,
                        children: [n(I, {
                            children: c.upgrades[e.type].body1
                        }), n(I, {
                            children: c.upgrades[e.type].body2
                        })]
                    })]
                }), n("div", {
                    class: G.price,
                    children: [n("img", {
                        src: R,
                        alt: "coin"
                    }), n(V, {
                        children: C(e.price)
                    }), e.lvl > 0 && n(S, {
                        children: [n(T, {
                            children: "|"
                        }), n(T, {
                            children: c.boost.level.replace("%value%", e.lvl.toString())
                        })]
                    })]
                }), t.player.shares < e.price && n("div", {
                    children: c.boost.insuffisient_funds
                })]
            })]
        })
    }
;

function cs() {
    const [e, t] = y(null)
        , [i, s] = y(null)
        , a = m(p);
    return B(() => {
            a.tapsSubmitService.submitTaps().catch(r => a.log.error("submitTaps failed", r))
        }
    ),
        n(A, {
            children: [n(ts, {
                onOpenBoostPopup: r => {
                    !e && !i && s(r)
                }
                ,
                onOpenPopUp: (r, l, g) => {
                    !e && !i && t({
                        type: r,
                        price: l,
                        lvl: g
                    })
                }
            }), e && n(os, {
                type: e.type,
                price: e.price,
                lvl: e.lvl,
                onClose: () => t(null)
            }), i && n(Fn, {
                type: i,
                onClose: () => s(null)
            })]
        })
}

const ls = "_backBtn_gxroi_1"
    , ds = {
        backBtn: ls
    }
    , nt = () => {
        const e = m(p);
        return e.env === "prod" ? n(S, {}) : n("button", {
            onClick: () => e.navService.back(),
            class: ds.backBtn,
            children: "back"
        })
    }
    ,
    hs = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M15.705%207.41L14.295%206L8.29498%2012L14.295%2018L15.705%2016.59L11.125%2012L15.705%207.41Z'%20fill='white'/%3e%3c/svg%3e"
    , gs = "_content_10kh8_1"
    , us = "_description_10kh8_10"
    , Xe = {
        content: gs,
        description: us
    }
    , it = e => n("div", {
        class: Xe.content,
        children: [n(V, {
            children: e.title
        }), n("div", {
            class: Xe.description,
            children: e.desc.split(`
`).map(t => {
                    const i = t.indexOf("https://phantom.app/");
                    return i === -1 ? n("p", {
                        children: t
                    }) : n(S, {
                        children: n("p", {
                            children: [t.slice(0, i), n("a", {
                                href: "https://phantom.app/",
                                target: "_blank",
                                children: "https://phantom.app/"
                            }), t.slice(i + 20)]
                        })
                    })
                }
            )
        })]
    })
    , ps = "_ligueContent_8l9ha_1"
    , ms = "_iamgeSlider_8l9ha_9"
    , _s = "_ligueImg_8l9ha_30"
    , we = {
        ligueContent: ps,
        iamgeSlider: ms,
        ligueImg: _s
    }
    , vs = "_wrapper_pywek_1"
    , ys = "_progressBackground_pywek_6"
    , fs = "_progressLine_pywek_16"
    , be = {
        wrapper: vs,
        progressBackground: ys,
        progressLine: fs
    }
    , Ve = e => n("div", {
        class: be.wrapper,
        children: n("div", {
            class: be.progressBackground,
            children: n("div", {
                class: be.progressLine,
                style: {
                    width: `${e.currentEnergy}%`
                }
            })
        })
    })
    , ws = "_wrapper_1prfp_1"
    , bs = "_text_1prfp_9"
    , Ge = {
        wrapper: ws,
        text: bs
    }
    , Cs = e => n("div", {
        class: Ge.wrapper,
        children: [n("div", {
            class: Ge.text,
            children: n(D, {
                children: [C(e.currentEnergy), " / ", C(e.energiLimit)]
            })
        }), n(Ve, {
            currentEnergy: e.currentEnergy / e.energiLimit * 100
        })]
    })
    , Bs = () => {
        const e = m(p)
            , [t, i] = y(e.player.ligue)
            , s = e.gameConf.getLigue(t)
            , a = e.gameConf.getLigueByNum(t - 1)
            , r = e.gameConf.getLigueByNum(t + 1);
        return n(O, {
            children: n("div", {
                class: we.ligueContent,
                children: [n(it, {
                    title: s.title,
                    desc: c.common.league_desc
                }), n("div", {
                    class: we.iamgeSlider,
                    children: [n("button", {
                        children: a && n("img", {
                            onClick: () => i(t - 1),
                            src: hs,
                            alt: "chevron left"
                        })
                    }), n("div", {
                        class: we.ligueImg,
                        children: n("img", {
                            src: _e(s.name),
                            alt: s.name
                        })
                    }), n("button", {
                        children: r && n("img", {
                            onClick: () => i(t + 1),
                            src: Pe,
                            alt: "chevron right"
                        })
                    })]
                }), t === e.player.ligue && r ? n(Cs, {
                    currentEnergy: e.player.totalEarned,
                    energiLimit: r.score
                }) : n(D, {
                    children: [c.common.from, " ", C(s.score)]
                })]
            })
        })
    }
;

function As() {
    return n(A, {
        children: [n(nt, {}), n(Bs, {}), n(E, {
            compensator: !0,
            children: n(M, {})
        })]
    })
}

const ks = () => {
        const e = m(p)
            , t = b(async () => {
                try {
                    const i = {};
                    e.botKey && (i.bot_key = e.botKey),
                        await e.api.player_sendInvite.post(i),
                        Telegram.WebApp.close()
                } catch (i) {
                    e.log.error("player_sendInvite failed", i)
                }
            }
            , [e.botKey, e.api.player_sendInvite, e.log]);
        return n(x, {
            variant: "primary",
            onClick: () => t().catch(console.error),
            size: "small",
            children: c.button.invite
        })
    }
    , Ss = "_refBalanceContainer_rqgos_1"
    , xs = {
        refBalanceContainer: Ss
    }
    , Ls = e => n("div", {
        class: xs.refBalanceContainer,
        children: [n(j, {
            children: c.ref.value_ref.replace("$value$", e.value.toString())
        }), n(J, {
            children: ["+", C(e.valueDiff)]
        })]
    })
    , Ts = "_listItem_qewdd_1"
    , Is = "_reward_qewdd_19"
    , Es = "_listItemBody_qewdd_23"
    , Ms = "_listItemProgress_qewdd_28"
    , Ds = "_navigationBox_qewdd_33"
    , U = {
        listItem: Ts,
        reward: Is,
        listItemBody: Es,
        listItemProgress: Ms,
        navigationBox: Ds
    }
    , Ps = e => n("button", {
        class: `${U.listItem}`,
        onClick: e.onClick,
        children: [n("div", {
            class: U.listItemBody,
            children: [n(ze, {
                img: e.img,
                name: e.name,
                balance: e.balance,
                ligue: e.ligue
            }), n("div", {
                class: U.navigationBox,
                children: [e.reward !== void 0 && n("div", {
                    class: U.reward,
                    children: n(J, {
                        children: ["+", Ee(e.reward, 0)]
                    })
                }), !e.disabled && n("img", {
                    src: Pe,
                    alt: "right chevron"
                })]
            })]
        }), n("div", {
            class: U.listItemProgress,
            children: n(Ve, {
                currentEnergy: e.ligueProgress
            })
        })]
    })
    , zs = e => {
        const t = m(p);
        return n(te, {
            children: e.referrals.map(i => {
                    const s = t.gameConf.ligues.findIndex(a => a.score > i.earned);
                    return n(Ps, {
                        name: i.full_name || i.name,
                        reward: i.rewards,
                        balance: i.earned,
                        disabled: !i.name,
                        ligue: t.gameConf.ligues[s - 1],
                        ligueProgress: i.earned * 100 / t.gameConf.ligues[s].score,
                        onClick: () => {
                            i.name && e.startConversation(i.name)
                        }
                    }, i.id)
                }
            )
        })
    }
    , Vs = "_info_13mj9_1"
    , Hs = "_empty_13mj9_7"
    , Ns = "_titleBtn_13mj9_15"
    , Ce = {
        info: Vs,
        empty: Hs,
        titleBtn: Ns
    }
    , Ws = () => {
        const e = m(p)
            , [t, i] = y();
        Z(() => {
                let a = !1;
                const r = () => {
                        !a && (t != null && t.has_more) && document.body.scrollTop > document.body.scrollHeight - window.innerHeight - 100 && (document.body.addEventListener("scroll", r),
                            a = !0,
                            e.api.player_getRefs.post({
                                skip: t.refs.length
                            }).then(l => {
                                    i({
                                        refs: t.refs.concat(l.refs),
                                        has_more: l.has_more
                                    }),
                                        a = !1
                                }
                            ).catch(l => {
                                    e.log.error("player_getRefs failed", l),
                                        a = !1
                                }
                            ))
                    }
                ;
                return document.body.addEventListener("scroll", r),
                    () => document.body.removeEventListener("scroll", r)
            }
            , [e.api.player_getRefs, e.log, t]),
            B(() => {
                    e.api.player_getRefs.post({}).then(a => {
                            i(a)
                        }
                    ).catch(a => {
                            e.log.error("player_getRefs failed", a)
                        }
                    )
                }
            );
        const s = a => {
                Telegram.WebApp.openTelegramLink(`https://t.me/${a}`)
            }
        ;
        return t === void 0 ? n(A, {
            page: "loading",
            children: [n(Te, {}), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        }) : t ? n(O, {
            children: [n("div", {
                class: Ce.info,
                children: n(Ls, {
                    value: e.player.stat.ref_cnt,
                    valueDiff: e.player.stat.ref_in
                })
            }), n(me, {}), n("div", {
                class: Ce.titleBtn,
                children: [n(D, {
                    children: c.ref.ref_list
                }), n(ks, {})]
            }), t.refs.length === 0 ? n("div", {
                class: Ce.empty,
                children: n(I, {
                    children: c.ref.empty
                })
            }) : n(zs, {
                referrals: t.refs,
                startConversation: s
            }), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        }) : n(A, {
            page: "loading",
            children: "Something went wrong :("
        })
    }
;

function Rs() {
    return n(A, {
        children: n(Ws, {})
    })
}

const js = "_infoContainer_1pp8i_1"
    , Os = {
    infoContainer: js
}
    , oe = e => n("div", {
    class: Os.infoContainer,
    children: [n(z, {
        children: e.text
    }), n(V, {
        children: C(e.value)
    })]
})
    , Xs = "_infoList_ji7jy_1"
    , Gs = {
    infoList: Xs
}
    , Us = ({stat: e}) => n(O, {
    children: [n(Je, {
        text: c.stat.total_b,
        children: n(Ze, {
            value: Math.floor(e.players.earned + e.players.reward - e.players.spent)
        })
    }), n(me, {}), n("div", {
        class: Gs.infoList,
        children: [n(oe, {
            text: c.stat.total_t,
            value: e.players.taps
        }), n(oe, {
            text: c.stat.total_p,
            value: e.accounts.total
        }), n(oe, {
            text: c.stat.daily_p,
            value: e.accounts.active
        }), n(oe, {
            text: c.stat.online_p,
            value: e.accounts.online
        })]
    })]
});

function Fs() {
    const e = m(p)
        , [t, i] = y();
    return B(() => {
            e.api.root_getStat.get({}).then(s => {
                    console.log("result", s),
                        i(s)
                }
            ).catch(s => {
                    e.log.error("root_getStat failed", s)
                }
            )
        }
    ),
        t ? n(A, {
            children: [n(Us, {
                stat: t
            }), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        }) : n(A, {
            page: "loading",
            children: [n(Te, {}), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        })
}

const qs = "_tapContainer_igohf_1"
    , Ys = "_boostCoinBg_igohf_9"
    , Qs = "_tapContent_igohf_31"
    , $s = "_text_igohf_44"
    , Zs = "_active_igohf_56"
    , N = {
    tapContainer: qs,
    boostCoinBg: Ys,
    tapContent: Qs,
    text: $s,
    active: Zs
};

class Ks {
    constructor(t, i, s) {
        o(this, "_readyElements", []);
        o(this, "_busyElements", []);
        o(this, "_animationDurationMs", 1500);
        o(this, "_animationDistancePx", 200);
        o(this, "_perspectiveObject");
        o(this, "_mainCoinElement");
        o(this, "_animationLayout");
        o(this, "_drawer");
        o(this, "_interval");
        o(this, "_active", !0);
        o(this, "run", () => {
                const t = f.now();
                for (let s = 0; s < this._busyElements.length; s++) {
                    const a = this._busyElements[s];
                    if (!a.activated) {
                        a.el.style.left = a.endPosition.x + "px",
                            a.el.style.top = a.endPosition.y + "px",
                            a.el.style.opacity = a.endAlpha.toString(),
                            a.activated = !0;
                        continue
                    }
                    a.realeaseTime <= t && (this._busyElements.splice(s, 1),
                        a.el.parentNode.removeChild(a.el),
                        this._readyElements.push(a.el))
                }
                this.player.getActiveBostByType("turbo") ? this._drawer.active || this._drawer.start() : this._drawer.active && this._drawer.stop()
            }
        );
        o(this, "onDown", t => {
                try {
                    if (!this.player.canTap)
                        return;
                    const i = t.offsetX
                        , s = t.offsetY
                        , a = this.container.getBoundingClientRect().width / 2;
                    if (Math.sqrt(Math.pow(t.offsetX - a, 2) + Math.pow(s - a, 2)) < a) {
                        this.setPerspective(i, s);
                        const l = this.getAnimatedElement(i, s, this._animationDurationMs);
                        this.appendAminamedElement(this.container, l, f.addMillis(f.now(), this._animationDurationMs), {
                            x: i,
                            y: s - this._animationDistancePx
                        }, 0),
                        this._drawer.active && this._drawer.pickOne(),
                            this.player.applyTap(),
                            Telegram.WebApp.HapticFeedback.impactOccurred("light"),
                        Telegram.WebApp.isClosingConfirmationEnabled || Telegram.WebApp.enableClosingConfirmation()
                    }
                } catch (i) {
                    this.log.error(i)
                }
            }
        );
        o(this, "onPointerUp", () => {
                this._perspectiveObject.style.transform = "none"
            }
        );
        this.player = t,
            this.container = i,
            this.log = s,
            this._perspectiveObject = this.container.getElementsByTagName("img")[0],
            this._mainCoinElement = document.getElementById("main_balance_coin"),
            this._animationLayout = document.getElementById("animation_layer"),
            this._drawer = new Js(this._animationLayout.getElementsByTagName("canvas")[0], this._mainCoinElement, this._perspectiveObject),
            window.addEventListener("touchend", this.onPointerUp),
            window.addEventListener("pointerup", this.onPointerUp),
            i.addEventListener("pointerdown", this.onDown),
            this._interval = setInterval(() => {
                    this.run()
                }
                , 75)
    }

    setPerspective(t, i) {
        const a = this.container.getBoundingClientRect()
            , r = -(i - a.height / 2) / 20
            , l = (t - a.width / 2) / 20;
        this._perspectiveObject.style.transform = `perspective(${a.width}px)    rotateX(` + r + "deg)    rotateY(" + l + "deg) "
    }

    getAnimatedElement(t, i, s) {
        const a = this._readyElements.pop() ?? this.createElement();
        return a.style.transitionDuration = s + "ms",
            a.textContent = "+" + this.player.tapRate.toString(),
            a.style.left = t + "px",
            a.style.top = i + "px",
            a.style.opacity = "1",
            a
    }

    appendAminamedElement(t, i, s, a, r) {
        this._busyElements.push({
            activated: !1,
            realeaseTime: s,
            endPosition: a,
            el: i,
            endAlpha: r
        }),
            t.appendChild(i)
    }

    createElement() {
        const t = document.createElement("h6");
        return t.className = N.text,
            t
    }

    dispose() {
        clearInterval(this._interval),
            window.removeEventListener("touchend", this.onPointerUp),
            window.removeEventListener("pointerup", this.onPointerUp),
            this.container.removeEventListener("pointerdown", this.onDown)
    }
}

class Js {
    constructor(t, i, s) {
        o(this, "_canvas");
        o(this, "_ctx");
        o(this, "_img");
        o(this, "_centerImage");
        o(this, "_coins", []);
        o(this, "_pickedCoins", []);
        o(this, "_distance", 100);
        o(this, "_speed", 2);
        o(this, "_coinAmountMin", 5);
        o(this, "_coinsAmountMax", 25);
        o(this, "_backWaySpeedIncrease", 1.2);
        o(this, "_active", !1);
        o(this, "radius", 0);
        o(this, "imgWidth");
        o(this, "imgHeight");
        o(this, "_coinSizeChanged", 0);
        o(this, "loop", () => {
                (this._coinSizeChanged + 25 < f.now() || this._pickedCoins.length === 0) && this._img.classList.remove(N.active),
                    this.createCoins(),
                    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height),
                !(this._coins.length === 0 && this._pickedCoins.length === 0) && (this.drawCoins(),
                    this.radius += this._speed,
                    this.cleanCoins(this._coins),
                    this.cleanCoins(this._pickedCoins),
                    requestAnimationFrame(this.loop))
            }
        );
        o(this, "angle", (t, i, s, a) => {
                const r = a - i
                    , l = s - t;
                return Math.atan2(r, l)
            }
        );
        this._canvas = t,
            t.style.width = window.innerWidth + "px",
            t.style.height = window.innerHeight + "px",
            t.width = window.innerWidth,
            t.height = window.innerHeight,
            this._img = i,
            this._centerImage = s,
            this._ctx = t.getContext("2d"),
            this.imgWidth = this._img.width / 2,
            this.imgHeight = this._img.height / 2
    }

    start() {
        this._active || (this._active = !0,
            this.loop())
    }

    stop() {
        this._active && (this._active = !1)
    }

    cleanCoins(t) {
        t.forEach((i, s) => {
                i.draw || t.splice(s, 1)
            }
        )
    }

    createCoins() {
        if (!this._active || this._coins.length > 0 && this.radius < this._distance)
            return;
        this.radius = 0;
        const t = this._centerImage.getBoundingClientRect()
            , i = 0
            , s = Math.floor(this._coinAmountMin + Math.random() * (this._coinsAmountMax - this._coinAmountMin));
        for (let a = 0; a < s; a++) {
            const r = Math.random()
                , l = a * (2 * Math.PI / s);
            this._coins.push({
                ancorX: t.x + t.width / 2,
                ancorY: t.y + t.height / 2,
                x: 0,
                y: 0,
                radius: i,
                speed: 1 + this._speed * r,
                draw: !0,
                alpha: r,
                angle: l > 0 ? l * .95 + Math.random() * l * .1 : -.2 + Math.random() * .4
            })
        }
        this._coins.sort((a, r) => a.alpha - r.alpha)
    }

    drawCoins() {
        const t = this._img.getBoundingClientRect();
        for (const i of this._pickedCoins) {
            if (!i.draw)
                continue;
            i.radius += i.speed;
            const s = this.angle(i.ancorX, i.ancorY, t.x + t.width / 2 - this.imgWidth / 2, t.y + t.height / 2 - this.imgHeight / 2);
            this.moveAndDrawCoin(i, s, t) || (this._img.classList.add(N.active),
                this._coinSizeChanged = f.now())
        }
        for (const i of this._coins)
            i.draw && (this._active ? i.radius += i.speed : (i.speed *= this._backWaySpeedIncrease,
                i.radius -= i.speed),
                this.moveAndDrawCoin(i, i.angle))
    }

    moveAndDrawCoin(t, i, s) {
        return t.x = t.ancorX - this.imgWidth / 2 + t.radius * Math.cos(i),
            t.y = t.ancorY - this.imgHeight / 2 + t.radius * Math.sin(i),
            this.isCoinNeedLeaveScene(t, s) ? (t.draw = !1,
                !1) : (this._ctx.globalAlpha = t.alpha,
                this._ctx.drawImage(this._img, t.x, t.y, this.imgWidth, this.imgHeight),
                !0)
    }

    isCoinNeedLeaveScene(t, i) {
        return i ? Math.abs(i.x + i.width / 2 - t.x - this.imgWidth / 2) < i.width / 2 && Math.abs(i.y + i.height / 2 - t.y - this.imgHeight / 2) < i.height / 2 : !this._active && t.radius < 0 ? !0 : t.x < -this.imgWidth || t.y < -this.imgHeight || t.x > this._canvas.width + this.imgWidth || t.y > this._canvas.height + this.imgHeight
    }

    pickOne() {
        if (this._coins.length === 0)
            return;
        const t = Math.floor(Math.random() * this._coins.length)
            , i = this._coins[t];
        i.draw = !1,
            this._pickedCoins.push({
                ...i,
                radius: 0,
                alpha: 1,
                draw: !0,
                speed: Math.ceil(this._speed * 2 + Math.random() * this._speed * 4),
                ancorX: i.x,
                ancorY: i.y
            })
    }

    get active() {
        return this._active
    }
}

function ea() {
    const e = m(p)
        , t = Le(null);
    return B(() => {
            if (t.current) {
                const i = new Ks(e.player, t.current, e.log);
                return () => i.dispose()
            }
        }
    ),
        n("div", {
            class: `${N.tapContainer} ${e.player.getActiveBostByType("turbo") && N.boostCoinBg}`,
            children: n("div", {
                ref: t,
                id: "ex1-layer",
                class: N.tapContent,
                children: n("img", {
                    draggable: !1,
                    src: R
                })
            })
        })
}

const ta = () => n("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: n("path", {
        d: "M9.70498 6L8.29498 7.41L12.875 12L8.29498 16.59L9.70498 18L15.705 12L9.70498 6Z",
        fill: "white"
    })
})
    , na = "_ligueBtn_8b3n6_1"
    , ia = {
    ligueBtn: na
}
    , sa = () => {
    const e = m(p)
        , t = e.player.currentLigue;
    return n("div", {
        class: ia.ligueBtn,
        onClick: () => e.navService.setPageWithBack("ligue"),
        children: [n(De, {
            img: _e(t.name),
            alt: t.name
        }), n(D, {
            children: t.name
        }), n(ta, {})]
    })
}
    , aa = "_balanceInfo_172y5_1"
    , ra = {
    balanceInfo: aa
}
    , st = () => n("div", {
    class: ra.balanceInfo,
    children: [n(Ke, {}), n(sa, {})]
})
    , oa = "_container_sn75j_1"
    , ca = {
    container: oa
}
    , la = () => n("div", {
    class: ca.container,
    children: [n(st, {}), n(ea, {})]
})
    , da = "_wrapper_iqvdz_1"
    , ha = {
    wrapper: da
}
    , ga = "_wrapper_16ny2_1"
    , ua = "_progressBackground_16ny2_6"
    , pa = "_progressLine_16ny2_16"
    , Be = {
    wrapper: ga,
    progressBackground: ua,
    progressLine: pa
}
    , ma = e => n("div", {
    class: Be.wrapper,
    children: n("div", {
        class: Be.progressBackground,
        children: n("div", {
            class: Be.progressLine,
            style: {
                width: `${e.currentEnergy}%`
            }
        })
    })
})
    , _a = "_wrapper_tzq8x_1"
    , va = "_text_tzq8x_8"
    , ya = "_value_tzq8x_13"
    , Ae = {
    wrapper: _a,
    text: va,
    value: ya
}
    , fa = e => n("div", {
    class: Ae.wrapper,
    children: [n("div", {
        class: Ae.text,
        children: [n(De, {
            img: ue,
            alt: "progress value"
        }), n("div", {
            class: Ae.value,
            children: [n(D, {
                children: e.currentEnergy
            }), n(J, {
                children: ["/ ", e.energiLimit]
            })]
        })]
    }), n(ma, {
        currentEnergy: e.currentEnergy / e.energiLimit * 100
    })]
});

function wa() {
    const e = m(p)
        , t = K(e.player.currentEnergy);
    return pt(() => {
            t.value = e.player.currentEnergy
        }
    ),
        B(() => {
                const i = setInterval(() => {
                        t.value = e.player.currentEnergy
                    }
                    , 500);
                return () => clearInterval(i)
            }
        ),
        n("div", {
            class: ha.wrapper,
            children: n(fa, {
                currentEnergy: t.value,
                energiLimit: e.player.currentEnergyLevel.limit
            })
        })
}

const ba = "_wrapper_1ab1s_1"
    , Ca = {
    wrapper: ba
}
    , Ba = () => n("div", {
    class: Ca.wrapper,
    children: [n(wa, {}), n(M, {})]
});

function Aa() {
    return B(() => {
            const e = t => {
                    t.preventDefault()
                }
            ;
            return window.addEventListener("contextmenu", e),
                window.addEventListener("touchmove", e, {
                    passive: !1
                }),
                Se(!0),
                () => {
                    Se(!1),
                        window.removeEventListener("touchmove", e),
                        window.removeEventListener("contextmenu", e)
                }
        }
    ),
        n(A, {
            page: "main",
            children: [n(O, {
                children: [n("div", {
                    id: "animation_layer",
                    className: $.animationLayer,
                    children: n("canvas", {})
                }), n(la, {})]
            }), n(E, {
                children: n(Ba, {})
            })]
        })
}

const ka = "_tabsContainer_ly1k8_1"
    , Sa = "_tabs_ly1k8_1"
    , xa = "_tab_ly1k8_1"
    , La = "_active_ly1k8_30"
    , Ta = "_taskAlert_ly1k8_34"
    , F = {
        tabsContainer: ka,
        tabs: Sa,
        tab: xa,
        active: La,
        taskAlert: Ta
    }
    , Ia = e => n("div", {
        class: F.tabsContainer,
        children: [n("div", {
            class: F.tabs,
            children: e.tabs.map((t, i) => n("button", {
                onClick: () => e.onTabChange(i),
                class: `${F.tab} ${e.activeTab === i && F.active} ${t.taskAlert && F.taskAlert}`,
                children: t.title
            }, i))
        }), e.tabs.map((t, i) => e.activeTab === i && t.tab)]
    })
    , Ea = "/assets/tasklist-QmnCOg_x.png"
    , Ma = "/assets/congratulations-xzur9oKX.png"
    , Da = "_image_19lh0_1"
    , Pa = "_price_19lh0_13"
    , za = "_drowerAction_19lh0_23"
    , Va = "_text_19lh0_30"
    , Ha = "_desc_19lh0_40"
    , q = {
        image: Da,
        price: Pa,
        drowerAction: za,
        text: Va,
        desc: Ha
    }
    , Na = e => {
        const t = m(p)
            , i = t.player.claims.value.find(a => a === e.missionConf.id)
            , s = b(async () => {
                try {
                    if (!i)
                        return;
                    const a = await t.api.player_claimReward.post({
                        task_id: i
                    });
                    t.player.update(a.player),
                        t.notification.showInfo("Done!")
                } catch (a) {
                    t.log.error("player_claimReward", a),
                        t.notification.showError("Error!")
                }
            }
            , [t.api.player_claimReward, t.log, t.notification, t.player, i]);
        return n(ee, {
            onAction: s,
            onClose: () => s,
            btnVariant: "primary",
            btnText: c.button.claim,
            children: [n("div", {
                class: q.image,
                children: n("img", {
                    src: Ma,
                    alt: "congratulations"
                })
            }), n("div", {
                class: q.drowerAction,
                children: [n("div", {
                    class: q.text,
                    children: [n(j, {
                        children: c.missions.conget
                    }), n("div", {
                        class: q.desc,
                        children: n(I, {
                            children: c.missions.congret_desc
                        })
                    })]
                }), n("div", {
                    class: q.price,
                    children: [n("img", {
                        src: R,
                        alt: "coin"
                    }), n(V, {
                        children: C(e.missionConf.reward)
                    })]
                })]
            })]
        })
    }
;

function Ue(e) {
    if (e.link)
        return e.link;
    if (!e.name)
        throw new Error("Social name is not defined");
    switch (e.type) {
        case "tg":
            return `https://t.me/${e.name.replace("@", "")}`;
        case "x":
            return `https://twitter.com/${e.name}`;
        default:
            return e.name
    }
}

const Wa = "_item_10hts_1"
    , Ra = "_link_10hts_10"
    , ja = "_disabled_10hts_22"
    , Oa = "_done_10hts_27"
    , ce = {
        item: Wa,
        link: Ra,
        disabled: ja,
        done: Oa
    }
    , Xa = ({item: e, confItem: t, disabled: i, onSubmit: s, claim: a, instrunctions: r}) => {
        const l = !e || !e.verified
            , [g, _] = y(!1)
            , d = b(() => e ? Math.max(e.verified_at !== void 0 ? e.verified_at + 3e4 - f.now() : 0, 0) : 0, [e])
            , [h, u] = y(e !== void 0 && (e.verified || e.verified_at !== void 0));
        Z(() => {
                u(h || e !== void 0 && (e.verified || e.verified_at !== void 0))
            }
            , [h, e]);
        const v = K(d());
        Z(() => {
                const rt = setInterval(() => {
                        v.value = d(),
                        v.value > 0 && _(!1)
                    }
                    , 1e3);
                return () => clearInterval(rt)
            }
            , [d, e, v]);
        const at = async () => {
                _(!0),
                    await s()
            }
            , He = () => {
                setTimeout(() => u(!0), 1e3)
            }
        ;
        return n("div", {
            className: `${ce.item} ${i && ce.disabled}`,
            children: [n("a", {
                onClick: He,
                href: Ue(t),
                target: "_blank",
                class: ce.link,
                children: [n(z, {
                    children: r || c.missions.instructions[t.type]
                }), !a && l && v.value > 0 && n(T, {
                    children: c.missions.erroe_message
                })]
            }), e && !h && n("a", {
                onClick: He,
                href: Ue(t),
                target: "_blank",
                children: n(x, {
                    onClick: async () => {
                    }
                    ,
                    size: "small",
                    variant: "secondary",
                    children: c.button.go
                })
            }), e && h && n(S, {
                children: (i || l) && !a ? n(x, {
                    onClick: at,
                    size: "small",
                    variant: "secondary",
                    disabled: l && v.value > 0 || i || g,
                    children: v.value > 0 ? Me(v.value) : c.button.check
                }) : n("div", {
                    class: ce.done,
                    children: c.missions.done
                })
            })]
        })
    }
    , Ga = "_container_1qbto_1"
    , Ua = "_content_1qbto_13"
    , Fa = "_list_1qbto_22"
    , qa = "_completed_1qbto_28"
    , ke = {
        container: Ga,
        content: Ua,
        list: Fa,
        completed: qa
    }
    , Ya = "_item_w3cz8_1"
    , Qa = "_link_w3cz8_10"
    , $a = "_mainText_w3cz8_21"
    , Za = "_text_w3cz8_28"
    , Ka = "_disabled_w3cz8_32"
    , Ja = "_done_w3cz8_37"
    , H = {
        item: Ya,
        link: Qa,
        mainText: $a,
        text: Za,
        disabled: Ka,
        done: Ja
    }
    , er = ({item: e, disabled: t, onSubmit: i, claim: s}) => {
        const a = m(p)
            , r = !e || !e.verified
            , [l, g] = y(!1)
            ,
            _ = b(() => !e || e.verified ? 0 : Math.max(e.verified_at !== void 0 ? e.verified_at + 3e4 - f.now() : 0, 0), [e])
            , d = K(_());
        Z(() => {
                const u = setInterval(() => {
                        d.value = _(),
                        d.value > 0 && g(!1)
                    }
                    , 1e3);
                return () => clearInterval(u)
            }
            , [_, e, d]);
        const h = async () => {
                g(!0),
                    await i()
            }
        ;
        return n("div", {
            className: `${H.item} ${t && H.disabled}`,
            children: n("div", {
                className: H.link,
                children: [n("div", {
                    className: H.mainText,
                    children: [n("h5", {
                        className: H.text,
                        children: c.missions.solana_wallet
                    }), n(x, {
                        variant: "secondary",
                        size: "small",
                        onClick: async () => {
                            const u = await a.api.wallet_getLoginToken.post({});
                            Telegram.WebApp.openLink(`/wallet/?token=${u.token}&userId=${a.player.id}`)
                        }
                        ,
                        children: (t || r) && !s ? c.button.go : c.button.open
                    }), e && n(S, {
                        children: (t || r) && !s ? n(x, {
                            onClick: h,
                            variant: "secondary",
                            size: "small",
                            disabled: r && d.value > 0 || t || l,
                            children: d.value > 0 ? Me(d.value) : c.button.check
                        }) : n("div", {
                            class: H.done,
                            children: c.missions.done
                        })
                    })]
                }), !s && r && d.value > 0 && n(T, {
                    children: c.missions.erroe_message
                })]
            })
        })
    }
    , tr = "_content_c1c79_1"
    , Fe = {
        content: tr
    }
    , nr = ({confItem: e, item: t, onSubmit: i, disabled: s}) => {
        var _;
        const a = m(p)
            , [r, l] = y("")
            , g = ((_ = t == null ? void 0 : t.user_data) == null ? void 0 : _.solana_addr) || "";
        return n("div", {
            class: `${Fe.content} ${s && Fe.disable}`,
            children: [n(z, {
                children: e.name
            }), n("input", {
                type: "string",
                disabled: s,
                value: g,
                onChange: d => l(d.currentTarget.value)
            }), n(x, {
                onClick: async () => {
                    if (e.type === "solana_addr" && r.length < 40)
                        return a.notification.showError("Invalid Solana address");
                    await i(r)
                }
                ,
                size: "small",
                variant: "secondary",
                disabled: s,
                children: c.button.submit
            })]
        })
    }
    , ir = "_content_mpn7y_1"
    , sr = "_info_mpn7y_13"
    , qe = {
        content: ir,
        info: sr
    }
    , ar = e => n("div", {
        class: qe.content,
        children: [n("img", {
            src: pe,
            alt: "coin"
        }), n("div", {
            class: qe.info,
            children: [n(z, {
                children: c.missions.reward
            }), n(T, {
                children: C(e.reward)
            })]
        })]
    })
    , rr = ({mConf: e}) => {
        const t = m(p)
            , [i, s] = y(t.account.getActiveMission(e.id))
            , a = t.player.claims.value.find(d => d === e.id)
            , r = t.account.isMissionCompleted(e.id)
            , l = b(async (d, h) => {
                try {
                    const u = await t.api.missions_finishMissionItem.post({
                        id: e.id,
                        itemIndex: d,
                        user_input: h
                    });
                    t.account.update(u.account),
                        s(t.account.getActiveMission(e.id))
                } catch (u) {
                    t.notification.showError(u.message)
                }
            }
            , [t.account, t.api.missions_finishMissionItem, t.notification, e.id])
            , g = async () => {
            try {
                const d = await t.api.missions_finishMission.post({
                    id: e.id
                });
                t.account.update(d.account),
                    t.player.update(d.player),
                    s(t.account.getActiveMission(e.id))
            } catch (d) {
                t.notification.showError(d.message)
            }
        }
            , _ = b(async () => {
                await t.api.missions_joinMission.post({
                    id: e.id
                }).then(d => {
                        t.account.update(d.account),
                            s(t.account.getActiveMission(e.id))
                    }
                ).catch(d => {
                        t.log.error(d)
                    }
                )
            }
            , [t.account, t.api.missions_joinMission, t.log, e.id]);
        return n("div", {
            className: ke.container,
            children: n("div", {
                class: ke.content,
                children: [n(nt, {}), n(it, {
                    title: e.title,
                    desc: e.description
                }), n(ar, {
                    reward: e.reward
                }), !i && !r && n(x, {
                    variant: "secondary",
                    size: "large",
                    onClick: _,
                    children: c.button.start_mission
                }), r && n("div", {
                    className: ke.completed,
                    children: c.missions.completed
                }), n(D, {
                    children: c.missions.your_task
                }), n(te, {
                    children: e.items.map((d, h) => {
                            if (d.type === "wallet_connect")
                                return n(er, {
                                    item: i == null ? void 0 : i.items[h],
                                    onSubmit: () => l(h),
                                    disabled: !1,
                                    claim: r
                                });
                            if (d.type !== "solana_addr") {
                                const v = (c.missions.individual_instrunctions[e.id] || [])[h];
                                return n(Xa, {
                                    confItem: e.items[h],
                                    item: i == null ? void 0 : i.items[h],
                                    disabled: !i && !r,
                                    claim: r,
                                    onSubmit: () => l(h),
                                    instrunctions: v
                                })
                            }
                            return n(nr, {
                                disabled: !i || !!((i == null ? void 0 : i.items[h]) !== void 0 && (i != null && i.items[h].verified)),
                                confItem: e.items[h],
                                item: i == null ? void 0 : i.items[h],
                                onSubmit: u => l(h, u)
                            })
                        }
                    )
                }), i && n(x, {
                    variant: "secondary",
                    size: "large",
                    onClick: g,
                    disabled: !t.account.canFinishMission(e.id),
                    children: c.button.finish_mission
                }), a && n(Na, {
                    missionConf: e
                })]
            })
        })
    }
    , or = () => {
        const e = m(p)
            , [t, i] = y(null);
        return t ? n(rr, {
            mConf: t
        }) : n(te, {
            children: e.account.availableMissions.concat(e.account.finishedMissions).map(s => {
                    const a = e.player.claims.value.find(l => l === s.id) === s.id
                        , r = e.account.isMissionCompleted(s.id);
                    return n(Q, {
                        name: s.title,
                        img: Ea,
                        balance: s.reward,
                        completed: !a && r,
                        needAction: a,
                        onClick: () => {
                            e.navService.regBackFunction(() => i(null)),
                                i(s)
                        }
                    })
                }
            )
        })
    }
    , cr = "_listItem_c1rrx_1"
    , lr = "_listItemBody_c1rrx_9"
    , dr = "_navigationBox_c1rrx_16"
    , hr = "_percentageBox_c1rrx_22"
    , gr = "_reward_c1rrx_26"
    , le = {
        listItem: cr,
        listItemBody: lr,
        navigationBox: dr,
        percentageBox: hr,
        reward: gr
    }
    , ur = e => n("div", {
        class: `${le.listItem}`,
        children: [n("div", {
            class: `${le.listItemBody}`,
            children: [n(ze, {
                img: e.img,
                name: e.name,
                balance: e.reward
            }), n("div", {
                class: le.navigationBox,
                children: n(x, {
                    variant: "primary",
                    size: "small",
                    onClick: e.onClaim,
                    disabled: e.disabled,
                    children: c.button.claim
                })
            })]
        }), e.percentage < 100 && n("div", {
            className: le.percentageBox,
            children: n(Ve, {
                currentEnergy: e.percentage
            })
        })]
    })
    , Ye = e => n(te, {
        children: e.tasks.map((t, i) => n(ur, {
            name: t.title,
            reward: t.reward,
            img: t.image,
            percentage: t.percentage,
            disabled: !t.canClaim,
            onClaim: () => e.onClaim(t)
        }, i))
    })
    , pr = () => {
        const e = m(p)
            , [t, i] = y(0)
            , s = b(() => {
                const h = e.player.getClaimsByType("L");
                return e.gameConf.ligues.map((u, v) => ({
                    taskId: `L${v}`,
                    title: u.name,
                    reward: u.reward,
                    canClaim: h.includes(v),
                    image: _e(u.name),
                    percentage: u.score > 0 ? e.player.totalEarned * 100 / u.score : 0
                })).filter((u, v) => h.includes(v) || v > e.player.ligue)
            }
            , [e.gameConf.ligues, e.player])
            , a = b(() => {
                const h = e.player.getClaimsByType("R");
                return e.gameConf.ref_rewards.map((u, v) => ({
                    taskId: `R${v}`,
                    title: `Invite ${u.cnt} friends`,
                    reward: u.reward,
                    canClaim: h.includes(v),
                    image: tt,
                    cnt: u.cnt,
                    percentage: e.player.stat.ref_cnt * 100 / u.cnt
                })).filter((u, v) => h.includes(v) || e.player.stat.ref_cnt < u.cnt)
            }
            , [e.gameConf.ref_rewards, e.player])
            , [r, l] = y(s())
            , [g, _] = y(a())
            , d = b(async h => {
                try {
                    const u = await e.api.player_claimReward.post({
                        task_id: h.taskId
                    });
                    if (e.player.update(u.player),
                        h.taskId.startsWith("L")) {
                        const v = s();
                        l(v)
                    } else {
                        const v = a();
                        _(v)
                    }
                    e.notification.showInfo("Done!")
                } catch (u) {
                    e.log.error("player_claimReward", u),
                        e.notification.showError("Error!")
                }
            }
            , [e.api.player_claimReward, e.log, e.notification, e.player, s, a]);
        return n(O, {
            children: [n(st, {}), n(me, {}), n(Ia, {
                onTabChange: h => {
                    i(h),
                        e.navService.clean()
                }
                ,
                activeTab: t,
                tabs: [{
                    title: c.task.tabs.missions,
                    tab: n(or, {}),
                    taskAlert: e.player.getClaimsByType("M").length > 0 || e.account.availableMissions.length > 0
                }, {
                    title: c.task.tabs.leagues,
                    tab: n(Ye, {
                        tasks: r,
                        onClaim: d
                    }),
                    taskAlert: r.find(h => h.canClaim) !== void 0
                }, {
                    title: c.task.tabs.ref_task,
                    tab: n(Ye, {
                        tasks: g,
                        onClaim: d
                    }),
                    taskAlert: g.find(h => h.canClaim) !== void 0
                }]
            }), n(E, {
                compensator: !0,
                children: n(M, {})
            })]
        })
    }
;

function mr() {
    const e = m(p);
    return B(() => {
            e.tapsSubmitService.submitTaps().catch(t => e.log.error("submitTaps failed", t))
        }
    ),
        n(A, {
            children: n(pr, {})
        })
}

function _r() {
    const e = m(p)
        , [t, i] = y(null)
        , [s, a] = y(null)
        , [r, l] = y();
    return B(() => {
            if (Telegram.WebApp.expand(),
                e.initAppBot(),
            e.env === "prod" && /* !Hn()*/
            false) {
                a(!0);
                return
            }
            const g = Object.fromEntries(new URLSearchParams(window.location.search).entries());

            function login() {
                e.api.account_login.post(g).then(_ => {
                        e.login(_),
                            i(_.player),
                            l(e.player.notificationClaim),
                            e.navService.setPage("taps")
                    }
                ).catch(_ => {
                    e.log.error("login_failed", _)
                    login();
                });
            }

            login(),
                e.navService.init(),
                Telegram.WebApp.setHeaderColor("#142883"),
                Telegram.WebApp.setBackgroundColor("#15277a"),
                Telegram.WebApp.ready()
        }
    ),
        s === !0 ? n(A, {
            page: "loading",
            children: n(Yt, {})
        }) : t ? n(S, {
            children: [(e.env !== "prod" || e.debugEnabled) && n(Ne, {}), e.navService.page === "taps" && n(Aa, {}), e.navService.page === "task" && n(mr, {}), e.navService.page === "boost" && n(cs, {}), e.navService.page === "ligue" && n(As, {}), e.navService.page === "ref" && n(Rs, {}), e.navService.page === "stat" && n(Fs, {}), e.player.tappedBalance < 0 && n(En, {}), r && n(Vn, {
                notification: r,
                onClose: () => {
                    l(void 0)
                }
            })]
        }) : n(A, {
            page: "loading",
            children: [e.env !== "prod" && n(Ne, {}), n(Te, {})]
        })
}

function vr() {
    return n(p.Provider, {
        value: Qe,
        children: n(_r, {})
    })
}

mt(n(vr, {}), document.getElementById("app"));
//# sourceMappingURL=main-ZhLL9w2J.js.map
