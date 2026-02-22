# INVENTORY cloud_backup_gdrive

## Command 1
```bash
rg -n "Backup su cloud|cloud backup|gdrive|google drive|oauth/start|oauth/callback|device/start|hassio_ingress|GDRIVE_OAUTH|GOOGLE_OAUTH"
```

```text
file_editor_plus/backend/app.py:49:DEFAULT_GDRIVE_OAUTH_CLIENT_ID = (
file_editor_plus/backend/app.py:50:    os.environ.get("GDRIVE_OAUTH_CLIENT_ID_DEFAULT")
file_editor_plus/backend/app.py:51:    or os.environ.get("DEFAULT_GDRIVE_OAUTH_CLIENT_ID")
file_editor_plus/backend/app.py:54:DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET = (
file_editor_plus/backend/app.py:55:    os.environ.get("GDRIVE_OAUTH_CLIENT_SECRET_DEFAULT")
file_editor_plus/backend/app.py:56:    or os.environ.get("DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET")
file_editor_plus/backend/app.py:273:GDRIVE_DIR = Path("/data/gdrive")
file_editor_plus/backend/app.py:278:_gdrive_lock = threading.Lock()
file_editor_plus/backend/app.py:279:_gdrive_device_state: Optional[dict] = None
file_editor_plus/backend/app.py:280:_gdrive_device_stop: Optional[threading.Event] = None
file_editor_plus/backend/app.py:281:_gdrive_schedule_stop = threading.Event()
file_editor_plus/backend/app.py:282:_gdrive_schedule_wake = threading.Event()
file_editor_plus/backend/app.py:283:_gdrive_last_auto_run: Optional[int] = None
file_editor_plus/backend/app.py:284:_gdrive_oauth_state_store: dict[str, dict] = {}
file_editor_plus/backend/app.py:285:GDRIVE_OAUTH_STATE_TTL_SECONDS = 600
file_editor_plus/backend/app.py:299:def _get_gdrive_client_id() -> Optional[str]:
file_editor_plus/backend/app.py:301:    cid = (opts.get("gdrive_client_id") or "").strip() if isinstance(opts, dict) else ""
file_editor_plus/backend/app.py:305:def _get_gdrive_option_str(key: str) -> str:
file_editor_plus/backend/app.py:312:def _resolve_gdrive_oauth_config() -> dict:
file_editor_plus/backend/app.py:313:    client_id = _get_gdrive_option_str("gdrive_client_id") or DEFAULT_GDRIVE_OAUTH_CLIENT_ID
file_editor_plus/backend/app.py:314:    client_secret = _get_gdrive_option_str("gdrive_client_secret") or DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET
file_editor_plus/backend/app.py:315:    redirect_override = _get_gdrive_option_str("gdrive_redirect_override") or _get_gdrive_option_str("gdrive_redirect_uri") or DEFAULT_GDRIVE_REDIRECT_OVERRIDE
file_editor_plus/backend/app.py:316:    public_base_url = _get_gdrive_option_str("public_base_url") or DEFAULT_PUBLIC_BASE_URL
file_editor_plus/backend/app.py:318:        addon_callback_port = int(_get_gdrive_option_str("addon_callback_port") or str(DEFAULT_ADDON_CALLBACK_PORT))
file_editor_plus/backend/app.py:329:        "client_id_source": "user" if _get_gdrive_option_str("gdrive_client_id") else ("env_default" if DEFAULT_GDRIVE_OAUTH_CLIENT_ID else "none"),
file_editor_plus/backend/app.py:330:        "client_secret_source": "user" if _get_gdrive_option_str("gdrive_client_secret") else ("env_default" if DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET else "none"),
file_editor_plus/backend/app.py:331:        "redirect_override_source": "user" if (_get_gdrive_option_str("gdrive_redirect_override") or _get_gdrive_option_str("gdrive_redirect_uri")) else ("env_default" if DEFAULT_GDRIVE_REDIRECT_OVERRIDE else "none"),
file_editor_plus/backend/app.py:332:        "public_base_url_source": "user" if _get_gdrive_option_str("public_base_url") else ("env_default" if DEFAULT_PUBLIC_BASE_URL else "none"),
file_editor_plus/backend/app.py:336:def _cleanup_gdrive_oauth_states(now_ts: Optional[int] = None) -> None:
file_editor_plus/backend/app.py:338:    with _gdrive_lock:
file_editor_plus/backend/app.py:339:        expired = [k for k, v in _gdrive_oauth_state_store.items() if int(v.get("expires_at") or 0) <= now]
file_editor_plus/backend/app.py:341:            _gdrive_oauth_state_store.pop(k, None)
file_editor_plus/backend/app.py:344:def _build_gdrive_pkce_pair() -> tuple[str, str]:
file_editor_plus/backend/app.py:363:    return f"{base}/api/cloud/gdrive/oauth/callback"
file_editor_plus/backend/app.py:383:            return f"{proto}://{host_no_port}:{callback_port}/api/cloud/gdrive/oauth/callback", "ingress_port"
file_editor_plus/backend/app.py:388:        return f"{direct_proto}://{direct_host}/api/cloud/gdrive/oauth/callback", "direct"
file_editor_plus/backend/app.py:389:    return f"{str(request.base_url).rstrip('/')}/api/cloud/gdrive/oauth/callback", "direct"
file_editor_plus/backend/app.py:392:def _load_gdrive_tokens() -> Optional[dict]:
file_editor_plus/backend/app.py:401:def _save_gdrive_tokens(tokens: dict) -> None:
file_editor_plus/backend/app.py:406:def _clear_gdrive_tokens() -> None:
file_editor_plus/backend/app.py:413:def _load_gdrive_config() -> dict:
file_editor_plus/backend/app.py:422:def _save_gdrive_config(cfg: dict) -> None:
file_editor_plus/backend/app.py:427:def _load_gdrive_schedule() -> dict:
file_editor_plus/backend/app.py:429:    Google Drive schedule config (persisted in `/data/gdrive/schedule.json`).
file_editor_plus/backend/app.py:499:def _save_gdrive_schedule(cfg: dict) -> None:
file_editor_plus/backend/app.py:569:def _is_gdrive_connected(tokens: Optional[dict]) -> bool:
file_editor_plus/backend/app.py:619:    cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:622:        raise HTTPException(503, "Google Drive non configurato: manca gdrive_client_id nelle opzioni add-on")
file_editor_plus/backend/app.py:623:    tokens = _load_gdrive_tokens()
file_editor_plus/backend/app.py:624:    if not _is_gdrive_connected(tokens):
file_editor_plus/backend/app.py:636:    _save_gdrive_tokens(tokens)
file_editor_plus/backend/app.py:685:    cfg = _load_gdrive_config()
file_editor_plus/backend/app.py:713:    _save_gdrive_config(cfg)
file_editor_plus/backend/app.py:720:    tmp = tempfile.NamedTemporaryFile(prefix="fep-gdrive-backup-", suffix=".zip", delete=False)
file_editor_plus/backend/app.py:822:    tmp = tempfile.NamedTemporaryFile(prefix="fep-gdrive-backup-", suffix=".zip", delete=False)
file_editor_plus/backend/app.py:849:    retention_cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:858:def _gdrive_schedule_loop():
file_editor_plus/backend/app.py:859:    global _gdrive_last_auto_run
file_editor_plus/backend/app.py:860:    while not _gdrive_schedule_stop.is_set():
file_editor_plus/backend/app.py:861:        cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:865:            _gdrive_schedule_wake.wait(timeout=30)
file_editor_plus/backend/app.py:866:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:871:            target = _compute_next_run_dt(cfg, now=now, last_run_epoch=_gdrive_last_auto_run)
file_editor_plus/backend/app.py:873:            _gdrive_schedule_wake.wait(timeout=30)
file_editor_plus/backend/app.py:874:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:878:        _gdrive_schedule_wake.wait(timeout=min(wait_s, 60 * 60))
file_editor_plus/backend/app.py:879:        if _gdrive_schedule_stop.is_set():
file_editor_plus/backend/app.py:881:        if _gdrive_schedule_wake.is_set():
file_editor_plus/backend/app.py:882:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:890:        last = int(_gdrive_last_auto_run or 0)
file_editor_plus/backend/app.py:893:        _gdrive_last_auto_run = int(time.time())
file_editor_plus/backend/app.py:901:_gdrive_schedule_thread_started = False
file_editor_plus/backend/app.py:904:def _ensure_gdrive_scheduler_started():
file_editor_plus/backend/app.py:905:    global _gdrive_schedule_thread_started
file_editor_plus/backend/app.py:906:    if _gdrive_schedule_thread_started:
file_editor_plus/backend/app.py:908:    _gdrive_schedule_thread_started = True
file_editor_plus/backend/app.py:909:    t = threading.Thread(target=_gdrive_schedule_loop, daemon=True, name="gdrive-scheduler")
file_editor_plus/backend/app.py:914:    global _gdrive_device_state, _gdrive_device_stop
file_editor_plus/backend/app.py:915:    if _gdrive_device_stop:
file_editor_plus/backend/app.py:916:        _gdrive_device_stop.set()
file_editor_plus/backend/app.py:917:    _gdrive_device_state = None
file_editor_plus/backend/app.py:918:    _gdrive_device_stop = None
file_editor_plus/backend/app.py:922:    global _gdrive_device_state
file_editor_plus/backend/app.py:928:            with _gdrive_lock:
file_editor_plus/backend/app.py:929:                if _gdrive_device_state:
file_editor_plus/backend/app.py:930:                    _gdrive_device_state["status"] = "expired"
file_editor_plus/backend/app.py:947:            with _gdrive_lock:
file_editor_plus/backend/app.py:948:                if _gdrive_device_state:
file_editor_plus/backend/app.py:949:                    _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:950:                    _gdrive_device_state["error"] = f"network: {e}"
file_editor_plus/backend/app.py:961:                with _gdrive_lock:
file_editor_plus/backend/app.py:962:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:963:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:964:                        _gdrive_device_state["error"] = "missing refresh_token"
file_editor_plus/backend/app.py:976:                _save_gdrive_tokens(tokens)
file_editor_plus/backend/app.py:978:                with _gdrive_lock:
file_editor_plus/backend/app.py:979:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:980:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:981:                        _gdrive_device_state["error"] = "cannot persist tokens"
file_editor_plus/backend/app.py:983:            with _gdrive_lock:
file_editor_plus/backend/app.py:984:                if _gdrive_device_state:
file_editor_plus/backend/app.py:985:                    _gdrive_device_state["status"] = "connected"
file_editor_plus/backend/app.py:993:                    with _gdrive_lock:
file_editor_plus/backend/app.py:994:                        if _gdrive_device_state:
file_editor_plus/backend/app.py:995:                            _gdrive_device_state["status"] = "slow_down"
file_editor_plus/backend/app.py:996:                            _gdrive_device_state["interval"] = next_sleep
file_editor_plus/backend/app.py:999:                with _gdrive_lock:
file_editor_plus/backend/app.py:1000:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:1001:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:1002:                        _gdrive_device_state["error"] = str(err)
file_editor_plus/backend/app.py:1005:        with _gdrive_lock:
file_editor_plus/backend/app.py:1006:            if _gdrive_device_state:
file_editor_plus/backend/app.py:1007:                _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:1008:                _gdrive_device_state["error"] = f"http_{resp.status_code}"
file_editor_plus/backend/app.py:2961:@app.get("/api/cloud/gdrive/status")
file_editor_plus/backend/app.py:2962:def gdrive_status():
file_editor_plus/backend/app.py:2963:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:2964:    tokens = _load_gdrive_tokens()
file_editor_plus/backend/app.py:2965:    with _gdrive_lock:
file_editor_plus/backend/app.py:2966:        state = dict(_gdrive_device_state) if _gdrive_device_state else None
file_editor_plus/backend/app.py:2971:        "connected": _is_gdrive_connected(tokens),
file_editor_plus/backend/app.py:2976:@app.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/app.py:2977:def gdrive_oauth_start(request: Request):
file_editor_plus/backend/app.py:2978:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:2981:        raise HTTPException(503, "Manca gdrive_client_id (opzioni add-on o fallback env)")
file_editor_plus/backend/app.py:2987:    verifier, challenge = _build_gdrive_pkce_pair()
file_editor_plus/backend/app.py:2988:    expires_at = int(time.time()) + GDRIVE_OAUTH_STATE_TTL_SECONDS
file_editor_plus/backend/app.py:2990:    _cleanup_gdrive_oauth_states()
file_editor_plus/backend/app.py:2991:    with _gdrive_lock:
file_editor_plus/backend/app.py:2992:        _gdrive_oauth_state_store[state] = {
file_editor_plus/backend/app.py:3011:    logger.info("gdrive_oauth_start mode=%s redirect_uri=%s", mode, redirect_uri)
file_editor_plus/backend/app.py:3015:@app.get("/api/cloud/gdrive/oauth/callback", response_class=HTMLResponse)
file_editor_plus/backend/app.py:3016:def gdrive_oauth_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
file_editor_plus/backend/app.py:3017:    global _gdrive_device_state
file_editor_plus/backend/app.py:3018:    _cleanup_gdrive_oauth_states()
file_editor_plus/backend/app.py:3033:    with _gdrive_lock:
file_editor_plus/backend/app.py:3034:        state_data = _gdrive_oauth_state_store.get(state)
file_editor_plus/backend/app.py:3040:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3043:        _gdrive_oauth_state_store[state]["used"] = True
file_editor_plus/backend/app.py:3045:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:3048:        with _gdrive_lock:
file_editor_plus/backend/app.py:3049:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3054:        with _gdrive_lock:
file_editor_plus/backend/app.py:3055:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3058:        with _gdrive_lock:
file_editor_plus/backend/app.py:3059:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3079:        existing = _load_gdrive_tokens() or {}
file_editor_plus/backend/app.py:3093:        _save_gdrive_tokens(merged)
file_editor_plus/backend/app.py:3095:        with _gdrive_lock:
file_editor_plus/backend/app.py:3096:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3098:    with _gdrive_lock:
file_editor_plus/backend/app.py:3099:        _gdrive_device_state = {"status": "connected", "source": "oauth_callback", "at": int(time.time())}
file_editor_plus/backend/app.py:3110:@app.post("/api/cloud/gdrive/device/start")
file_editor_plus/backend/app.py:3111:def gdrive_device_start():
file_editor_plus/backend/app.py:3112:    global _gdrive_device_state, _gdrive_device_stop
file_editor_plus/backend/app.py:3113:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:3116:        raise HTTPException(503, "Manca gdrive_client_id nelle opzioni add-on")
file_editor_plus/backend/app.py:3118:    with _gdrive_lock:
file_editor_plus/backend/app.py:3119:        if _gdrive_device_state and _gdrive_device_state.get("status") in ("pending", "slow_down"):
file_editor_plus/backend/app.py:3120:            return {"ok": True, **_gdrive_device_state}
file_editor_plus/backend/app.py:3148:        name="gdrive-device-flow",
file_editor_plus/backend/app.py:3150:    with _gdrive_lock:
file_editor_plus/backend/app.py:3151:        _gdrive_device_state = state
file_editor_plus/backend/app.py:3152:        _gdrive_device_stop = stop_event
file_editor_plus/backend/app.py:3157:@app.post("/api/cloud/gdrive/device/cancel")
file_editor_plus/backend/app.py:3158:def gdrive_device_cancel():
file_editor_plus/backend/app.py:3159:    with _gdrive_lock:
file_editor_plus/backend/app.py:3160:        if _gdrive_device_stop:
file_editor_plus/backend/app.py:3161:            _gdrive_device_stop.set()
file_editor_plus/backend/app.py:3166:@app.post("/api/cloud/gdrive/disconnect")
file_editor_plus/backend/app.py:3167:def gdrive_disconnect():
file_editor_plus/backend/app.py:3168:    with _gdrive_lock:
file_editor_plus/backend/app.py:3170:    _clear_gdrive_tokens()
file_editor_plus/backend/app.py:3178:@app.post("/api/cloud/gdrive/backup")
file_editor_plus/backend/app.py:3179:def gdrive_backup_manual():
file_editor_plus/backend/app.py:3190:@app.get("/api/cloud/gdrive/schedule")
file_editor_plus/backend/app.py:3191:def gdrive_get_schedule():
file_editor_plus/backend/app.py:3192:    cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:3194:    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
file_editor_plus/backend/app.py:3198:@app.put("/api/cloud/gdrive/schedule")
file_editor_plus/backend/app.py:3199:def gdrive_put_schedule(body: dict):
file_editor_plus/backend/app.py:3242:    _save_gdrive_schedule(cfg)
file_editor_plus/backend/app.py:3244:        _ensure_gdrive_scheduler_started()
file_editor_plus/backend/app.py:3245:    _gdrive_schedule_wake.set()
file_editor_plus/backend/app.py:3246:    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
file_editor_plus/frontend/src/app-root.ts:111:  private gdrivePollTimer: number | null = null;
file_editor_plus/frontend/src/app-root.ts:206:    gdriveStatus: { state: true },
file_editor_plus/frontend/src/app-root.ts:207:    gdriveSchedule: { state: true },
file_editor_plus/frontend/src/app-root.ts:208:    gdriveOauthInfo: { state: true },
file_editor_plus/frontend/src/app-root.ts:209:    gdriveLoading: { state: true },
file_editor_plus/frontend/src/app-root.ts:210:    gdriveSavingSchedule: { state: true },
file_editor_plus/frontend/src/app-root.ts:254:  declare gdriveStatus: any;
file_editor_plus/frontend/src/app-root.ts:255:  declare gdriveSchedule: any;
file_editor_plus/frontend/src/app-root.ts:256:  declare gdriveOauthInfo: { redirect_uri?: string; mode?: string } | null;
file_editor_plus/frontend/src/app-root.ts:257:  declare gdriveLoading: boolean;
file_editor_plus/frontend/src/app-root.ts:258:  declare gdriveSavingSchedule: boolean;
file_editor_plus/frontend/src/app-root.ts:599:    this.gdriveStatus = null;
file_editor_plus/frontend/src/app-root.ts:600:    this.gdriveSchedule = null;
file_editor_plus/frontend/src/app-root.ts:601:    this.gdriveOauthInfo = null;
file_editor_plus/frontend/src/app-root.ts:602:    this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:603:    this.gdriveSavingSchedule = false;
file_editor_plus/frontend/src/app-root.ts:721:    if (this.gdrivePollTimer !== null) {
file_editor_plus/frontend/src/app-root.ts:722:      window.clearInterval(this.gdrivePollTimer);
file_editor_plus/frontend/src/app-root.ts:723:      this.gdrivePollTimer = null;
file_editor_plus/frontend/src/app-root.ts:988:    this.gdriveStatus = statusPayload;
file_editor_plus/frontend/src/app-root.ts:989:    this.gdriveSchedule = schedulePayload;
file_editor_plus/frontend/src/app-root.ts:994:    this.gdriveLoading = true;
file_editor_plus/frontend/src/app-root.ts:998:      if (import.meta.env.DEV) console.warn("gdrive load failed", e);
file_editor_plus/frontend/src/app-root.ts:1001:      this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:1007:    this.gdriveOauthInfo = null;
file_editor_plus/frontend/src/app-root.ts:1008:    if (this.gdrivePollTimer !== null) {
file_editor_plus/frontend/src/app-root.ts:1009:      window.clearInterval(this.gdrivePollTimer);
file_editor_plus/frontend/src/app-root.ts:1010:      this.gdrivePollTimer = null;
file_editor_plus/frontend/src/app-root.ts:1015:    if (this.gdrivePollTimer !== null) return;
file_editor_plus/frontend/src/app-root.ts:1016:    this.gdrivePollTimer = window.setInterval(async () => {
file_editor_plus/frontend/src/app-root.ts:1020:        this.gdriveStatus = sp;
file_editor_plus/frontend/src/app-root.ts:1022:          window.clearInterval(this.gdrivePollTimer!);
file_editor_plus/frontend/src/app-root.ts:1023:          this.gdrivePollTimer = null;
file_editor_plus/frontend/src/app-root.ts:1030:          window.clearInterval(this.gdrivePollTimer!);
file_editor_plus/frontend/src/app-root.ts:1031:          this.gdrivePollTimer = null;
file_editor_plus/frontend/src/app-root.ts:1040:    this.gdriveLoading = true;
file_editor_plus/frontend/src/app-root.ts:1055:      this.gdriveOauthInfo = {
file_editor_plus/frontend/src/app-root.ts:1059:      const popup = window.open(String(payload.auth_url), "gdrive_oauth", "width=520,height=720");
file_editor_plus/frontend/src/app-root.ts:1069:      this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:1074:    this.gdriveLoading = true;
file_editor_plus/frontend/src/app-root.ts:1083:      this.gdriveStatus = { ...(this.gdriveStatus || {}), device_flow: payload };
file_editor_plus/frontend/src/app-root.ts:1087:      this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:1101:    this.gdriveLoading = true;
file_editor_plus/frontend/src/app-root.ts:1113:      this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:1118:    this.gdriveLoading = true;
file_editor_plus/frontend/src/app-root.ts:1129:      this.gdriveLoading = false;
file_editor_plus/frontend/src/app-root.ts:1134:    const cfg = this.gdriveSchedule;
file_editor_plus/frontend/src/app-root.ts:1163:    this.gdriveSavingSchedule = true;
file_editor_plus/frontend/src/app-root.ts:1172:      this.gdriveSchedule = respPayload;
file_editor_plus/frontend/src/app-root.ts:1175:      this.gdriveSavingSchedule = false;
file_editor_plus/frontend/src/app-root.ts:3731:                ${this.gdriveLoading
file_editor_plus/frontend/src/app-root.ts:3735:                  const st = this.gdriveStatus || {};
file_editor_plus/frontend/src/app-root.ts:3739:                  const sched = this.gdriveSchedule || {};
file_editor_plus/frontend/src/app-root.ts:3741:                  const oauthInfo = this.gdriveOauthInfo || {};
file_editor_plus/frontend/src/app-root.ts:3744:                  const ingressDetected = window.location.pathname.includes("/api/hassio_ingress/");
file_editor_plus/frontend/src/app-root.ts:3757:                              ? "Non configurato (manca gdrive_client_id nelle opzioni add-on)"
file_editor_plus/frontend/src/app-root.ts:3765:                            ? html`<button class="btn" ?disabled=${this.gdriveLoading} @click=${() => this.disconnectGdrive()}>Disconnetti</button>`
file_editor_plus/frontend/src/app-root.ts:3766:                            : html`<button class="btn primary" ?disabled=${this.gdriveLoading} @click=${() => this.startGdriveOAuthFlow()}>
file_editor_plus/frontend/src/app-root.ts:3810:                                ?disabled=${this.gdriveLoading}
file_editor_plus/frontend/src/app-root.ts:3822:                              <button class="btn" ?disabled=${this.gdriveLoading} @click=${() => this.cancelGdriveDeviceFlow()}>Annulla</button>
file_editor_plus/frontend/src/app-root.ts:3833:                        <button class="btn primary" ?disabled=${this.gdriveLoading || !connected} @click=${() => this.runGdriveBackupNow()}>
file_editor_plus/frontend/src/app-root.ts:3844:                            ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3847:                              this.gdriveSchedule = { ...(sched || {}), enabled: checked };
file_editor_plus/frontend/src/app-root.ts:3857:                              ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3869:                                this.gdriveSchedule = next;
file_editor_plus/frontend/src/app-root.ts:3887:                                  ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3890:                                    this.gdriveSchedule = { ...(sched || {}), mode: "hourly", hour_interval: v };
file_editor_plus/frontend/src/app-root.ts:3900:                                        ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3903:                                          this.gdriveSchedule = { ...(sched || {}), mode: "weekly", weekday: v };
file_editor_plus/frontend/src/app-root.ts:3924:                                        ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3927:                                          this.gdriveSchedule = { ...(sched || {}), mode: "monthly", monthday: v };
file_editor_plus/frontend/src/app-root.ts:3937:                                    ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3940:                                      this.gdriveSchedule = { ...(sched || {}), at_time: v };
file_editor_plus/frontend/src/app-root.ts:3952:                              ?disabled=${this.gdriveSavingSchedule}
file_editor_plus/frontend/src/app-root.ts:3955:                                this.gdriveSchedule = { ...(sched || {}), retention_count: v };
file_editor_plus/frontend/src/app-root.ts:3964:                          <button class="btn" ?disabled=${this.gdriveSavingSchedule} @click=${() => this.saveGdriveSchedule()}>
file_editor_plus/frontend/src/app-root.ts:3965:                            ${this.gdriveSavingSchedule ? "Salvataggio…" : "Salva"}
file_editor_plus/backend/test_gdrive_oauth.py:13:        with app._gdrive_lock:
file_editor_plus/backend/test_gdrive_oauth.py:14:            app._gdrive_oauth_state_store.clear()
file_editor_plus/backend/test_gdrive_oauth.py:15:            app._gdrive_device_state = None
file_editor_plus/backend/test_gdrive_oauth.py:20:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:32:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:39:        with app._gdrive_lock:
file_editor_plus/backend/test_gdrive_oauth.py:40:            self.assertTrue(len(app._gdrive_oauth_state_store) == 1)
file_editor_plus/backend/test_gdrive_oauth.py:45:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:49:                "redirect_uri": "https://override.example/api/cloud/gdrive/oauth/callback",
file_editor_plus/backend/test_gdrive_oauth.py:50:                "redirect_override": "https://override.example/api/cloud/gdrive/oauth/callback",
file_editor_plus/backend/test_gdrive_oauth.py:55:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:59:        self.assertEqual(data.get("redirect_uri"), "https://override.example/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:64:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:74:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:78:        self.assertEqual(data.get("redirect_uri"), "https://public.example/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:83:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:94:                "/api/cloud/gdrive/oauth/start",
file_editor_plus/backend/test_gdrive_oauth.py:96:                    "x-ingress-path": "/api/hassio_ingress/abc123",
file_editor_plus/backend/test_gdrive_oauth.py:104:        self.assertEqual(data.get("redirect_uri"), "http://localhost:8099/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:107:        res = self.client.get("/api/cloud/gdrive/oauth/callback?code=test-code&state=invalid-state")
file_editor_plus/backend/test_gdrive_oauth.py:112:        with patch.object(app, "_load_gdrive_tokens", return_value={"access_token": "a", "expires_at": future}), patch.object(
file_editor_plus/backend/test_gdrive_oauth.py:113:            app, "_resolve_gdrive_oauth_config", return_value={"client_id": "cid-test", "client_secret": None, "redirect_uri": None, "client_id_source": "env_default", "client_secret_source": "none"}
file_editor_plus/backend/test_gdrive_oauth.py:115:            res = self.client.get("/api/cloud/gdrive/status")
file_editor_plus/frontend/src/services/api.ts:277:  const url = `${apiBase}api/cloud/gdrive/status`;
file_editor_plus/frontend/src/services/api.ts:282:  const url = `${apiBase}api/cloud/gdrive/device/start`;
file_editor_plus/frontend/src/services/api.ts:287:  const url = `${apiBase}api/cloud/gdrive/oauth/start`;
file_editor_plus/frontend/src/services/api.ts:292:  const url = `${apiBase}api/cloud/gdrive/device/cancel`;
file_editor_plus/frontend/src/services/api.ts:297:  const url = `${apiBase}api/cloud/gdrive/disconnect`;
file_editor_plus/frontend/src/services/api.ts:302:  const url = `${apiBase}api/cloud/gdrive/backup`;
file_editor_plus/frontend/src/services/api.ts:307:  const url = `${apiBase}api/cloud/gdrive/schedule`;
file_editor_plus/frontend/src/services/api.ts:326:  const url = `${apiBase}api/cloud/gdrive/schedule`;
file_editor_plus/config.yaml:29:  gdrive_client_id: ""
file_editor_plus/config.yaml:30:  gdrive_client_secret: ""
file_editor_plus/config.yaml:31:  gdrive_redirect_uri: ""
file_editor_plus/config.yaml:32:  gdrive_redirect_override: ""
file_editor_plus/config.yaml:37:  gdrive_client_id: str
file_editor_plus/config.yaml:38:  gdrive_client_secret: str
file_editor_plus/config.yaml:39:  gdrive_redirect_uri: str
file_editor_plus/config.yaml:40:  gdrive_redirect_override: str
file_editor_plus/frontend/src/i18n/it.json:357:    "cloud": "Backup su cloud",
file_editor_plus/README.md:45:- `gdrive_client_id` (opzionale)
file_editor_plus/README.md:46:- `gdrive_client_secret` (opzionale)
file_editor_plus/README.md:47:- `gdrive_redirect_uri` (opzionale)
file_editor_plus/README.md:49:Se `gdrive_client_id` non e' impostato nelle opzioni, il backend prova fallback da variabili ambiente:
file_editor_plus/README.md:50:- `GDRIVE_OAUTH_CLIENT_ID_DEFAULT` / `DEFAULT_GDRIVE_OAUTH_CLIENT_ID`
file_editor_plus/README.md:51:- `GDRIVE_OAUTH_CLIENT_SECRET_DEFAULT` / `DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET`
file_editor_plus/README.md:64:- La sorgente corretta e' la response di `GET /api/cloud/gdrive/oauth/start`.
file_editor_plus/README.md:67:  - `override` (usa `gdrive_redirect_override`)
file_editor_plus/README.md:75:- Errore redirect URI mismatch: imposta `gdrive_redirect_uri` coerente con URL Ingress dell'add-on.
file_editor_plus/README.md:81:| `404 callback` | URI registrata ma callback non raggiunge l'add-on | Configura `public_base_url` o `gdrive_redirect_override` con endpoint raggiungibile |
file_editor_plus/README.md:89:  - `<public_base_url>/api/cloud/gdrive/oauth/callback`
file_editor_plus/README.md:90:- Opzione 2: usa `gdrive_redirect_override` con URI completa.
file_editor_plus/README.md:92:  - `https://<host>:<addon_callback_port>/api/cloud/gdrive/oauth/callback` (default porta `8099`)
future_features/cloud_backup_gdrive/README.md:4:La feature "Backup su cloud" è stata rimossa dal percorso attivo per evitare problemi di release e stabilità su OAuth/Ingress.
future_features/cloud_backup_gdrive/README.md:5:Il codice viene mantenuto in `future_features/cloud_backup_gdrive/` per poter essere riattivato in modo controllato.
AI/AI_RUNBOOK.md:14:  - (Cloud Backup) Google Drive richiede `gdrive_client_id` nelle opzioni dell'add-on (vedi `file_editor_plus/config.yaml` -> `options/schema`).
AI/KNOWLEDGE.yaml:34:    notes: "Ingress abilitato; mount /config:rw; permessi Supervisor/Core API (vedi manifest). Opzioni cloud: `gdrive_client_id`, `gdrive_client_secret`, `gdrive_redirect_uri`, `gdrive_redirect_override`, `public_base_url`, `addon_callback_port`."
AI/KNOWLEDGE.yaml:42:  - id: "backend:gdrive"
AI/KNOWLEDGE.yaml:46:    notes: "Device Flow + upload ZIP di /config su Drive; storage `/data/gdrive/*`; endpoints `/api/cloud/gdrive/*`. Resolver OAuth config con fallback env (`GDRIVE_OAUTH_*` / `DEFAULT_GDRIVE_OAUTH_*`). OAuth start+callback con state/PKCE e persistenza token."
AI/KNOWLEDGE.yaml:84:  - id: "context:gdrive_oauth_map"
AI/KNOWLEDGE.yaml:87:    path: "AI/CONTEXT/gdrive_oauth_flow_map.md"
AI/KNOWLEDGE.yaml:90:  - id: "qa:gdrive_smoke"
AI/KNOWLEDGE.yaml:115:    to: "backend:gdrive"
AI/KNOWLEDGE.yaml:121:  - from: "backend:gdrive"
AI/KNOWLEDGE.yaml:123:    to: "context:gdrive_oauth_map"
AI/KNOWLEDGE.yaml:125:  - from: "backend:gdrive"
AI/KNOWLEDGE.yaml:127:    to: "qa:gdrive_smoke"
AI/KNOWLEDGE.yaml:147:      - "file_editor_plus/backend/test_gdrive_oauth.py"
AI/KNOWLEDGE.yaml:173:    notes: "Mostrati in modal i campi `redirect_uri` e `mode` forniti da `/api/cloud/gdrive/oauth/start`."
AI/KNOWLEDGE.yaml:176:    summary: "Aggiunta diagnostica sicura su `/oauth/start`: response con `redirect_uri`/`mode` e log backend senza segreti."
AI/KNOWLEDGE.yaml:220:    summary: "Aggiunti parametri espliciti per redirect OAuth stabile (`public_base_url`, `addon_callback_port`, `gdrive_redirect_override`) in options add-on e resolver backend."
AI/KNOWLEDGE.yaml:247:      - "file_editor_plus/backend/test_gdrive_oauth.py"
AI/KNOWLEDGE.yaml:275:    summary: "Frontend connect migrato a OAuth popup: `Connetti` usa `/api/cloud/gdrive/oauth/start` e polling status invariato."
AI/KNOWLEDGE.yaml:293:    notes: "Mantiene compatibilità con polling frontend esistente su `/api/cloud/gdrive/status`."
AI/KNOWLEDGE.yaml:296:    summary: "Implementato callback OAuth (`/api/cloud/gdrive/oauth/callback`) con validazione state, token exchange e persistenza token."
AI/KNOWLEDGE.yaml:306:    summary: "Aggiunto endpoint OAuth start (`/api/cloud/gdrive/oauth/start`) con state+PKCE e store in-memory con TTL."
AI/KNOWLEDGE.yaml:323:      - "rg \"gdrive_client_id\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:324:      - "rg \"secrets|GDRIVE_OAUTH_CLIENT\" -n file_editor_plus/backend/app.py file_editor_plus/config.yaml"
AI/KNOWLEDGE.yaml:332:      - "AI/CONTEXT/gdrive_oauth_flow_map.md"
AI/KNOWLEDGE.yaml:335:      - "rg \"gdrive\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:336:      - "rg \"/api/cloud/gdrive\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:337:      - "rg \"device/start\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:548:    summary: "Rivalidate opzioni add-on per Google Drive (`gdrive_client_id`) e documentato prerequisito nel runbook."
AI/KNOWLEDGE.yaml:554:      - "rg -n -S \"gdrive_client_id\" ."
AI/KNOWLEDGE.yaml:556:    notes: "Opzioni add-on: `file_editor_plus/config.yaml` contiene `options/schema` per `gdrive_client_id`. Backend legge da `/data/options.json`."
AI/KNOWLEDGE.yaml:597:    summary: "Aggiornati audit e knowledge: Save As ora crea file (non download) e Backup Cloud e' wired a UI+API gdrive."
AI/KNOWLEDGE.yaml:633:    notes: "La voce `Backup -> Cloud` non e' piu' disabled; il modal gestisce connect/polling (backend thread) e schedule via `/api/cloud/gdrive/schedule`."
AI/KNOWLEDGE.yaml:655:    notes: "Nuovi endpoint: GET status, POST device/start|cancel|disconnect, POST backup. Token persistiti in `/data/gdrive/tokens.json`."
AI/KNOWLEDGE.yaml:658:    summary: "Decisione credenziali Google Drive: usare add-on options (`gdrive_client_id`) invece di Application Credentials."
AI/DECISIONS.md:71:  - Usare **add-on options** per configurare `gdrive_client_id` (in `file_editor_plus/config.yaml`), senza dipendere da `application_credentials`.
AI/DECISIONS.md:108:  - Default: usare OAuth Authorization Code (`/api/cloud/gdrive/oauth/start` + popup Google).
AI/DECISIONS.md:120:  - Il prefisso Ingress (`/api/hassio_ingress/<token>/`) è dinamico e non registrabile in Google Cloud.
AI/AI_TASKS.md:1:# AI_TASKS — Rimozione totale pannello “Backup su cloud” (quarantena in future_features) — develop
AI/AI_TASKS.md:3:> Target: **rimuovere fisicamente dalla UI** ogni riferimento a “Backup su cloud” e **rimuovere/disconnettere** backend/API/config/test relativi a Google Drive/Cloud Backup.
AI/AI_TASKS.md:4:> Regola: **non si perde nulla** → tutto ciò che viene rimosso dal percorso “attivo” va **spostato/copiato** sotto `future_features/cloud_backup_gdrive/`.
AI/AI_TASKS.md:12:- **Permesso:** modificare SOLO i file trovati nello STEP 1 (INVENTORY) + creare/spostare file in `future_features/cloud_backup_gdrive/**`.
AI/AI_TASKS.md:21:**Goal:** avere una mappa oggettiva di tutto ciò che riguarda “Backup su cloud / gdrive / oauth” e creare la struttura `future_features`.
AI/AI_TASKS.md:26:   - `future_features/cloud_backup_gdrive/`
AI/AI_TASKS.md:29:   - `future_features/cloud_backup_gdrive/README.md` (2 sezioni: “Perché disabilitata”, “Cosa serve per riattivarla”)
AI/AI_TASKS.md:30:   - `future_features/cloud_backup_gdrive/INVENTORY.md`
AI/AI_TASKS.md:33:   - `rg -n "Backup su cloud|cloud backup|gdrive|google drive|oauth/start|oauth/callback|device/start|hassio_ingress|GDRIVE_OAUTH|GOOGLE_OAUTH"`
AI/AI_TASKS.md:34:   - `rg -n "/api/cloud/gdrive"`
AI/AI_TASKS.md:35:   - `rg -n "gdrive_"`
AI/AI_TASKS.md:41:- Commit msg: `chore(future_features): add cloud_backup_gdrive inventory and quarantine scaffold`
AI/AI_TASKS.md:43:  - `git add future_features/cloud_backup_gdrive/README.md future_features/cloud_backup_gdrive/INVENTORY.md`
AI/AI_TASKS.md:44:  - `git commit -m "chore(future_features): add cloud_backup_gdrive inventory and quarantine scaffold"`
AI/AI_TASKS.md:49:## STEP 2 — Rimozione UI: sparisce il pannello/modale “Backup su cloud”
AI/AI_TASKS.md:51:**Goal:** la UI non deve più mostrare alcun pannello, tab, sezione o modal legato a “Backup su cloud”.
AI/AI_TASKS.md:56:   - renderizzano il pannello/modale “Backup su cloud”
AI/AI_TASKS.md:58:   - mostrano toast relativi a `gdrive_client_id`, oauth, drive
AI/AI_TASKS.md:61:   - Spostare il file in `future_features/cloud_backup_gdrive/frontend/...` mantenendo struttura simile.
AI/AI_TASKS.md:65:   - Rimuovere SOLO il blocco di UI (import + render + handlers) relativo a cloud backup.
AI/AI_TASKS.md:66:   - Copiare il blocco rimosso in `future_features/cloud_backup_gdrive/snippets/ui_backup_modal.md` (come riferimento).
AI/AI_TASKS.md:74:- Commit msg: `chore(ui): remove cloud backup panel from UI (moved to future_features)`
AI/AI_TASKS.md:77:  - `git commit -m "chore(ui): remove cloud backup panel from UI (moved to future_features)"`
AI/AI_TASKS.md:82:## STEP 3 — Backend: scollegare e rimuovere endpoint /api/cloud/gdrive/\*
AI/AI_TASKS.md:84:**Goal:** nessun endpoint gdrive/oAuth/device/status legato a cloud backup deve rimanere attivo nel backend.
AI/AI_TASKS.md:89:   - `GET /api/cloud/gdrive/oauth/start`
AI/AI_TASKS.md:90:   - `GET /api/cloud/gdrive/oauth/callback`
AI/AI_TASKS.md:91:   - eventuali `device/start`, `status`, upload/backup endpoints
AI/AI_TASKS.md:94:   - Spostare i file in `future_features/cloud_backup_gdrive/backend/...`
AI/AI_TASKS.md:99:   - Copiare l’intero blocco rimosso in `future_features/cloud_backup_gdrive/backend/app_routes_snapshot.py`.
AI/AI_TASKS.md:104:   - Facoltativo: verificare che `/api/cloud/gdrive/*` ora risponda 404 (non 500).
AI/AI_TASKS.md:108:- Commit msg: `chore(api): remove gdrive cloud-backup endpoints (moved to future_features)`
AI/AI_TASKS.md:111:  - `git commit -m "chore(api): remove gdrive cloud-backup endpoints (moved to future_features)"`
AI/AI_TASKS.md:116:## STEP 4 — Config/add-on: rimuovere opzioni, env template, docs di gdrive dal percorso attivo
AI/AI_TASKS.md:118:**Goal:** nessun riferimento attivo a `gdrive_*`, `GDRIVE_OAUTH_*`, `GOOGLE_OAUTH_*` deve rimanere nella config “live” (se non usato da altre feature).
AI/AI_TASKS.md:123:   - `rg -n "gdrive_|GDRIVE_OAUTH|GOOGLE_OAUTH"`
AI/AI_TASKS.md:125:2. Per ogni file che è **solo** per cloud backup:
AI/AI_TASKS.md:126:   - Spostare in `future_features/cloud_backup_gdrive/config/...` o `docs/...`
AI/AI_TASKS.md:130:   - Copiare schema precedente in `future_features/cloud_backup_gdrive/config/options_schema_snapshot.yaml`.
AI/AI_TASKS.md:138:- Commit msg: `chore(config): remove cloud-backup gdrive options/docs from active addon (archived)`
AI/AI_TASKS.md:141:  - `git commit -m "chore(config): remove cloud-backup gdrive options/docs from active addon (archived)"`
AI/AI_TASKS.md:146:## STEP 5 — Test/CI: rimuovere test gdrive dal percorso attivo e archiviare
AI/AI_TASKS.md:148:**Goal:** la suite test/CI non deve più includere test gdrive; niente rotture CI.
AI/AI_TASKS.md:152:1. Identificare file test (da INVENTORY) relativi a gdrive/oauth.
AI/AI_TASKS.md:153:2. Spostarli in `future_features/cloud_backup_gdrive/tests/...`.
AI/AI_TASKS.md:160:- Commit msg: `chore(test): archive gdrive oauth tests under future_features and keep CI green`
AI/AI_TASKS.md:163:  - `git commit -m "chore(test): archive gdrive oauth tests under future_features and keep CI green"`
AI/AI_TASKS.md:170:**Goal:** rimuovere dipendenze introdotte esclusivamente per cloud backup, senza impattare altre feature.
AI/AI_TASKS.md:200:   - aprire app → verificare assenza totale di “Backup su cloud”
AI/AI_TASKS.md:201:   - nessuna chiamata di rete a `/api/cloud/gdrive/*`
AI/AI_TASKS.md:212:- Commit msg: `docs: mark cloud backup feature as archived (future_features)`
AI/AI_TASKS.md:215:  - `git commit -m "docs: mark cloud backup feature as archived (future_features)"`
AI/AI_TASKS.md:222:- UI: nessuna stringa “Backup su cloud” presente (`rg -n "Backup su cloud"` → 0 risultati nel percorso attivo).
AI/AI_TASKS.md:223:- Backend: nessuna route `/api/cloud/gdrive/*` registrata (risponde 404).
AI/AI_TASKS.md:224:- Nessun riferimento a `gdrive_*` in config attiva.
AI/AI_TASKS.md:226:- Tutto il codice rimosso è recuperabile in `future_features/cloud_backup_gdrive/**`.
AI/CONTEXT/gdrive_oauth_flow_map.md:10:2. Frontend calls `POST /api/cloud/gdrive/device/start`.
AI/CONTEXT/gdrive_oauth_flow_map.md:11:3. Backend endpoint `gdrive_device_start()` validates `gdrive_client_id` from add-on options (`/data/options.json`).
AI/CONTEXT/gdrive_oauth_flow_map.md:13:5. Frontend stores device state in `gdriveStatus.device_flow` and starts polling `GET /api/cloud/gdrive/status` every 2 seconds.
AI/CONTEXT/gdrive_oauth_flow_map.md:15:7. On success backend persists tokens in `/data/gdrive/tokens.json` and updates in-memory state to `connected`.
AI/CONTEXT/gdrive_oauth_flow_map.md:19:- Tokens file: `/data/gdrive/tokens.json`
AI/CONTEXT/gdrive_oauth_flow_map.md:20:- Config file: `/data/gdrive/config.json`
AI/CONTEXT/gdrive_oauth_flow_map.md:21:- Schedule file: `/data/gdrive/schedule.json`
AI/CONTEXT/gdrive_oauth_flow_map.md:23:  - `_gdrive_device_state`
AI/CONTEXT/gdrive_oauth_flow_map.md:24:  - `_gdrive_device_stop`
AI/CONTEXT/gdrive_oauth_flow_map.md:25:  - `_gdrive_lock`
AI/CONTEXT/gdrive_oauth_flow_map.md:29:  - `gdrive_client_id`
AI/CONTEXT/gdrive_oauth_flow_map.md:33:- `GET /api/cloud/gdrive/status`
AI/CONTEXT/gdrive_oauth_flow_map.md:34:- `POST /api/cloud/gdrive/device/start`
AI/CONTEXT/gdrive_oauth_flow_map.md:35:- `POST /api/cloud/gdrive/device/cancel`
AI/CONTEXT/gdrive_oauth_flow_map.md:36:- `POST /api/cloud/gdrive/disconnect`
AI/CONTEXT/gdrive_oauth_flow_map.md:37:- `POST /api/cloud/gdrive/backup`
AI/CONTEXT/gdrive_oauth_flow_map.md:38:- `GET /api/cloud/gdrive/schedule`
AI/CONTEXT/gdrive_oauth_flow_map.md:39:- `PUT /api/cloud/gdrive/schedule`
```

## Command 2
```bash
rg -n "/api/cloud/gdrive"
```

```text
AI/KNOWLEDGE.yaml:46:    notes: "Device Flow + upload ZIP di /config su Drive; storage `/data/gdrive/*`; endpoints `/api/cloud/gdrive/*`. Resolver OAuth config con fallback env (`GDRIVE_OAUTH_*` / `DEFAULT_GDRIVE_OAUTH_*`). OAuth start+callback con state/PKCE e persistenza token."
AI/KNOWLEDGE.yaml:173:    notes: "Mostrati in modal i campi `redirect_uri` e `mode` forniti da `/api/cloud/gdrive/oauth/start`."
AI/KNOWLEDGE.yaml:275:    summary: "Frontend connect migrato a OAuth popup: `Connetti` usa `/api/cloud/gdrive/oauth/start` e polling status invariato."
AI/KNOWLEDGE.yaml:293:    notes: "Mantiene compatibilità con polling frontend esistente su `/api/cloud/gdrive/status`."
AI/KNOWLEDGE.yaml:296:    summary: "Implementato callback OAuth (`/api/cloud/gdrive/oauth/callback`) con validazione state, token exchange e persistenza token."
AI/KNOWLEDGE.yaml:306:    summary: "Aggiunto endpoint OAuth start (`/api/cloud/gdrive/oauth/start`) con state+PKCE e store in-memory con TTL."
AI/KNOWLEDGE.yaml:336:      - "rg \"/api/cloud/gdrive\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:633:    notes: "La voce `Backup -> Cloud` non e' piu' disabled; il modal gestisce connect/polling (backend thread) e schedule via `/api/cloud/gdrive/schedule`."
AI/DECISIONS.md:108:  - Default: usare OAuth Authorization Code (`/api/cloud/gdrive/oauth/start` + popup Google).
AI/CONTEXT/gdrive_oauth_flow_map.md:10:2. Frontend calls `POST /api/cloud/gdrive/device/start`.
AI/CONTEXT/gdrive_oauth_flow_map.md:13:5. Frontend stores device state in `gdriveStatus.device_flow` and starts polling `GET /api/cloud/gdrive/status` every 2 seconds.
AI/CONTEXT/gdrive_oauth_flow_map.md:33:- `GET /api/cloud/gdrive/status`
AI/CONTEXT/gdrive_oauth_flow_map.md:34:- `POST /api/cloud/gdrive/device/start`
AI/CONTEXT/gdrive_oauth_flow_map.md:35:- `POST /api/cloud/gdrive/device/cancel`
AI/CONTEXT/gdrive_oauth_flow_map.md:36:- `POST /api/cloud/gdrive/disconnect`
AI/CONTEXT/gdrive_oauth_flow_map.md:37:- `POST /api/cloud/gdrive/backup`
AI/CONTEXT/gdrive_oauth_flow_map.md:38:- `GET /api/cloud/gdrive/schedule`
AI/CONTEXT/gdrive_oauth_flow_map.md:39:- `PUT /api/cloud/gdrive/schedule`
AI/AI_TASKS.md:34:   - `rg -n "/api/cloud/gdrive"`
AI/AI_TASKS.md:82:## STEP 3 — Backend: scollegare e rimuovere endpoint /api/cloud/gdrive/\*
AI/AI_TASKS.md:89:   - `GET /api/cloud/gdrive/oauth/start`
AI/AI_TASKS.md:90:   - `GET /api/cloud/gdrive/oauth/callback`
AI/AI_TASKS.md:104:   - Facoltativo: verificare che `/api/cloud/gdrive/*` ora risponda 404 (non 500).
AI/AI_TASKS.md:201:   - nessuna chiamata di rete a `/api/cloud/gdrive/*`
AI/AI_TASKS.md:223:- Backend: nessuna route `/api/cloud/gdrive/*` registrata (risponde 404).
file_editor_plus/README.md:64:- La sorgente corretta e' la response di `GET /api/cloud/gdrive/oauth/start`.
file_editor_plus/README.md:89:  - `<public_base_url>/api/cloud/gdrive/oauth/callback`
file_editor_plus/README.md:92:  - `https://<host>:<addon_callback_port>/api/cloud/gdrive/oauth/callback` (default porta `8099`)
file_editor_plus/backend/test_gdrive_oauth.py:32:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:49:                "redirect_uri": "https://override.example/api/cloud/gdrive/oauth/callback",
file_editor_plus/backend/test_gdrive_oauth.py:50:                "redirect_override": "https://override.example/api/cloud/gdrive/oauth/callback",
file_editor_plus/backend/test_gdrive_oauth.py:55:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:59:        self.assertEqual(data.get("redirect_uri"), "https://override.example/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:74:            res = self.client.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/test_gdrive_oauth.py:78:        self.assertEqual(data.get("redirect_uri"), "https://public.example/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:94:                "/api/cloud/gdrive/oauth/start",
file_editor_plus/backend/test_gdrive_oauth.py:104:        self.assertEqual(data.get("redirect_uri"), "http://localhost:8099/api/cloud/gdrive/oauth/callback")
file_editor_plus/backend/test_gdrive_oauth.py:107:        res = self.client.get("/api/cloud/gdrive/oauth/callback?code=test-code&state=invalid-state")
file_editor_plus/backend/test_gdrive_oauth.py:115:            res = self.client.get("/api/cloud/gdrive/status")
file_editor_plus/backend/app.py:363:    return f"{base}/api/cloud/gdrive/oauth/callback"
file_editor_plus/backend/app.py:383:            return f"{proto}://{host_no_port}:{callback_port}/api/cloud/gdrive/oauth/callback", "ingress_port"
file_editor_plus/backend/app.py:388:        return f"{direct_proto}://{direct_host}/api/cloud/gdrive/oauth/callback", "direct"
file_editor_plus/backend/app.py:389:    return f"{str(request.base_url).rstrip('/')}/api/cloud/gdrive/oauth/callback", "direct"
file_editor_plus/backend/app.py:2961:@app.get("/api/cloud/gdrive/status")
file_editor_plus/backend/app.py:2976:@app.get("/api/cloud/gdrive/oauth/start")
file_editor_plus/backend/app.py:3015:@app.get("/api/cloud/gdrive/oauth/callback", response_class=HTMLResponse)
file_editor_plus/backend/app.py:3110:@app.post("/api/cloud/gdrive/device/start")
file_editor_plus/backend/app.py:3157:@app.post("/api/cloud/gdrive/device/cancel")
file_editor_plus/backend/app.py:3166:@app.post("/api/cloud/gdrive/disconnect")
file_editor_plus/backend/app.py:3178:@app.post("/api/cloud/gdrive/backup")
file_editor_plus/backend/app.py:3190:@app.get("/api/cloud/gdrive/schedule")
file_editor_plus/backend/app.py:3198:@app.put("/api/cloud/gdrive/schedule")
```

## Command 3
```bash
rg -n "gdrive_"
```

```text
file_editor_plus/backend/app.py:278:_gdrive_lock = threading.Lock()
file_editor_plus/backend/app.py:279:_gdrive_device_state: Optional[dict] = None
file_editor_plus/backend/app.py:280:_gdrive_device_stop: Optional[threading.Event] = None
file_editor_plus/backend/app.py:281:_gdrive_schedule_stop = threading.Event()
file_editor_plus/backend/app.py:282:_gdrive_schedule_wake = threading.Event()
file_editor_plus/backend/app.py:283:_gdrive_last_auto_run: Optional[int] = None
file_editor_plus/backend/app.py:284:_gdrive_oauth_state_store: dict[str, dict] = {}
file_editor_plus/backend/app.py:299:def _get_gdrive_client_id() -> Optional[str]:
file_editor_plus/backend/app.py:301:    cid = (opts.get("gdrive_client_id") or "").strip() if isinstance(opts, dict) else ""
file_editor_plus/backend/app.py:305:def _get_gdrive_option_str(key: str) -> str:
file_editor_plus/backend/app.py:312:def _resolve_gdrive_oauth_config() -> dict:
file_editor_plus/backend/app.py:313:    client_id = _get_gdrive_option_str("gdrive_client_id") or DEFAULT_GDRIVE_OAUTH_CLIENT_ID
file_editor_plus/backend/app.py:314:    client_secret = _get_gdrive_option_str("gdrive_client_secret") or DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET
file_editor_plus/backend/app.py:315:    redirect_override = _get_gdrive_option_str("gdrive_redirect_override") or _get_gdrive_option_str("gdrive_redirect_uri") or DEFAULT_GDRIVE_REDIRECT_OVERRIDE
file_editor_plus/backend/app.py:316:    public_base_url = _get_gdrive_option_str("public_base_url") or DEFAULT_PUBLIC_BASE_URL
file_editor_plus/backend/app.py:318:        addon_callback_port = int(_get_gdrive_option_str("addon_callback_port") or str(DEFAULT_ADDON_CALLBACK_PORT))
file_editor_plus/backend/app.py:329:        "client_id_source": "user" if _get_gdrive_option_str("gdrive_client_id") else ("env_default" if DEFAULT_GDRIVE_OAUTH_CLIENT_ID else "none"),
file_editor_plus/backend/app.py:330:        "client_secret_source": "user" if _get_gdrive_option_str("gdrive_client_secret") else ("env_default" if DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET else "none"),
file_editor_plus/backend/app.py:331:        "redirect_override_source": "user" if (_get_gdrive_option_str("gdrive_redirect_override") or _get_gdrive_option_str("gdrive_redirect_uri")) else ("env_default" if DEFAULT_GDRIVE_REDIRECT_OVERRIDE else "none"),
file_editor_plus/backend/app.py:332:        "public_base_url_source": "user" if _get_gdrive_option_str("public_base_url") else ("env_default" if DEFAULT_PUBLIC_BASE_URL else "none"),
file_editor_plus/backend/app.py:336:def _cleanup_gdrive_oauth_states(now_ts: Optional[int] = None) -> None:
file_editor_plus/backend/app.py:338:    with _gdrive_lock:
file_editor_plus/backend/app.py:339:        expired = [k for k, v in _gdrive_oauth_state_store.items() if int(v.get("expires_at") or 0) <= now]
file_editor_plus/backend/app.py:341:            _gdrive_oauth_state_store.pop(k, None)
file_editor_plus/backend/app.py:344:def _build_gdrive_pkce_pair() -> tuple[str, str]:
file_editor_plus/backend/app.py:392:def _load_gdrive_tokens() -> Optional[dict]:
file_editor_plus/backend/app.py:401:def _save_gdrive_tokens(tokens: dict) -> None:
file_editor_plus/backend/app.py:406:def _clear_gdrive_tokens() -> None:
file_editor_plus/backend/app.py:413:def _load_gdrive_config() -> dict:
file_editor_plus/backend/app.py:422:def _save_gdrive_config(cfg: dict) -> None:
file_editor_plus/backend/app.py:427:def _load_gdrive_schedule() -> dict:
file_editor_plus/backend/app.py:499:def _save_gdrive_schedule(cfg: dict) -> None:
file_editor_plus/backend/app.py:569:def _is_gdrive_connected(tokens: Optional[dict]) -> bool:
file_editor_plus/backend/app.py:619:    cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:622:        raise HTTPException(503, "Google Drive non configurato: manca gdrive_client_id nelle opzioni add-on")
file_editor_plus/backend/app.py:623:    tokens = _load_gdrive_tokens()
file_editor_plus/backend/app.py:624:    if not _is_gdrive_connected(tokens):
file_editor_plus/backend/app.py:636:    _save_gdrive_tokens(tokens)
file_editor_plus/backend/app.py:685:    cfg = _load_gdrive_config()
file_editor_plus/backend/app.py:713:    _save_gdrive_config(cfg)
file_editor_plus/backend/app.py:849:    retention_cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:858:def _gdrive_schedule_loop():
file_editor_plus/backend/app.py:859:    global _gdrive_last_auto_run
file_editor_plus/backend/app.py:860:    while not _gdrive_schedule_stop.is_set():
file_editor_plus/backend/app.py:861:        cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:865:            _gdrive_schedule_wake.wait(timeout=30)
file_editor_plus/backend/app.py:866:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:871:            target = _compute_next_run_dt(cfg, now=now, last_run_epoch=_gdrive_last_auto_run)
file_editor_plus/backend/app.py:873:            _gdrive_schedule_wake.wait(timeout=30)
file_editor_plus/backend/app.py:874:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:878:        _gdrive_schedule_wake.wait(timeout=min(wait_s, 60 * 60))
file_editor_plus/backend/app.py:879:        if _gdrive_schedule_stop.is_set():
file_editor_plus/backend/app.py:881:        if _gdrive_schedule_wake.is_set():
file_editor_plus/backend/app.py:882:            _gdrive_schedule_wake.clear()
file_editor_plus/backend/app.py:890:        last = int(_gdrive_last_auto_run or 0)
file_editor_plus/backend/app.py:893:        _gdrive_last_auto_run = int(time.time())
file_editor_plus/backend/app.py:901:_gdrive_schedule_thread_started = False
file_editor_plus/backend/app.py:904:def _ensure_gdrive_scheduler_started():
file_editor_plus/backend/app.py:905:    global _gdrive_schedule_thread_started
file_editor_plus/backend/app.py:906:    if _gdrive_schedule_thread_started:
file_editor_plus/backend/app.py:908:    _gdrive_schedule_thread_started = True
file_editor_plus/backend/app.py:909:    t = threading.Thread(target=_gdrive_schedule_loop, daemon=True, name="gdrive-scheduler")
file_editor_plus/backend/app.py:914:    global _gdrive_device_state, _gdrive_device_stop
file_editor_plus/backend/app.py:915:    if _gdrive_device_stop:
file_editor_plus/backend/app.py:916:        _gdrive_device_stop.set()
file_editor_plus/backend/app.py:917:    _gdrive_device_state = None
file_editor_plus/backend/app.py:918:    _gdrive_device_stop = None
file_editor_plus/backend/app.py:922:    global _gdrive_device_state
file_editor_plus/backend/app.py:928:            with _gdrive_lock:
file_editor_plus/backend/app.py:929:                if _gdrive_device_state:
file_editor_plus/backend/app.py:930:                    _gdrive_device_state["status"] = "expired"
file_editor_plus/backend/app.py:947:            with _gdrive_lock:
file_editor_plus/backend/app.py:948:                if _gdrive_device_state:
file_editor_plus/backend/app.py:949:                    _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:950:                    _gdrive_device_state["error"] = f"network: {e}"
file_editor_plus/backend/app.py:961:                with _gdrive_lock:
file_editor_plus/backend/app.py:962:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:963:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:964:                        _gdrive_device_state["error"] = "missing refresh_token"
file_editor_plus/backend/app.py:976:                _save_gdrive_tokens(tokens)
file_editor_plus/backend/app.py:978:                with _gdrive_lock:
file_editor_plus/backend/app.py:979:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:980:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:981:                        _gdrive_device_state["error"] = "cannot persist tokens"
file_editor_plus/backend/app.py:983:            with _gdrive_lock:
file_editor_plus/backend/app.py:984:                if _gdrive_device_state:
file_editor_plus/backend/app.py:985:                    _gdrive_device_state["status"] = "connected"
file_editor_plus/backend/app.py:993:                    with _gdrive_lock:
file_editor_plus/backend/app.py:994:                        if _gdrive_device_state:
file_editor_plus/backend/app.py:995:                            _gdrive_device_state["status"] = "slow_down"
file_editor_plus/backend/app.py:996:                            _gdrive_device_state["interval"] = next_sleep
file_editor_plus/backend/app.py:999:                with _gdrive_lock:
file_editor_plus/backend/app.py:1000:                    if _gdrive_device_state:
file_editor_plus/backend/app.py:1001:                        _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:1002:                        _gdrive_device_state["error"] = str(err)
file_editor_plus/backend/app.py:1005:        with _gdrive_lock:
file_editor_plus/backend/app.py:1006:            if _gdrive_device_state:
file_editor_plus/backend/app.py:1007:                _gdrive_device_state["status"] = "error"
file_editor_plus/backend/app.py:1008:                _gdrive_device_state["error"] = f"http_{resp.status_code}"
file_editor_plus/backend/app.py:2962:def gdrive_status():
file_editor_plus/backend/app.py:2963:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:2964:    tokens = _load_gdrive_tokens()
file_editor_plus/backend/app.py:2965:    with _gdrive_lock:
file_editor_plus/backend/app.py:2966:        state = dict(_gdrive_device_state) if _gdrive_device_state else None
file_editor_plus/backend/app.py:2971:        "connected": _is_gdrive_connected(tokens),
file_editor_plus/backend/app.py:2977:def gdrive_oauth_start(request: Request):
file_editor_plus/backend/app.py:2978:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:2981:        raise HTTPException(503, "Manca gdrive_client_id (opzioni add-on o fallback env)")
file_editor_plus/backend/app.py:2987:    verifier, challenge = _build_gdrive_pkce_pair()
file_editor_plus/backend/app.py:2990:    _cleanup_gdrive_oauth_states()
file_editor_plus/backend/app.py:2991:    with _gdrive_lock:
file_editor_plus/backend/app.py:2992:        _gdrive_oauth_state_store[state] = {
file_editor_plus/backend/app.py:3011:    logger.info("gdrive_oauth_start mode=%s redirect_uri=%s", mode, redirect_uri)
file_editor_plus/backend/app.py:3016:def gdrive_oauth_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
file_editor_plus/backend/app.py:3017:    global _gdrive_device_state
file_editor_plus/backend/app.py:3018:    _cleanup_gdrive_oauth_states()
file_editor_plus/backend/app.py:3033:    with _gdrive_lock:
file_editor_plus/backend/app.py:3034:        state_data = _gdrive_oauth_state_store.get(state)
file_editor_plus/backend/app.py:3040:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3043:        _gdrive_oauth_state_store[state]["used"] = True
file_editor_plus/backend/app.py:3045:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:3048:        with _gdrive_lock:
file_editor_plus/backend/app.py:3049:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3054:        with _gdrive_lock:
file_editor_plus/backend/app.py:3055:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3058:        with _gdrive_lock:
file_editor_plus/backend/app.py:3059:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3079:        existing = _load_gdrive_tokens() or {}
file_editor_plus/backend/app.py:3093:        _save_gdrive_tokens(merged)
file_editor_plus/backend/app.py:3095:        with _gdrive_lock:
file_editor_plus/backend/app.py:3096:            _gdrive_oauth_state_store.pop(state, None)
file_editor_plus/backend/app.py:3098:    with _gdrive_lock:
file_editor_plus/backend/app.py:3099:        _gdrive_device_state = {"status": "connected", "source": "oauth_callback", "at": int(time.time())}
file_editor_plus/backend/app.py:3111:def gdrive_device_start():
file_editor_plus/backend/app.py:3112:    global _gdrive_device_state, _gdrive_device_stop
file_editor_plus/backend/app.py:3113:    oauth_cfg = _resolve_gdrive_oauth_config()
file_editor_plus/backend/app.py:3116:        raise HTTPException(503, "Manca gdrive_client_id nelle opzioni add-on")
file_editor_plus/backend/app.py:3118:    with _gdrive_lock:
file_editor_plus/backend/app.py:3119:        if _gdrive_device_state and _gdrive_device_state.get("status") in ("pending", "slow_down"):
file_editor_plus/backend/app.py:3120:            return {"ok": True, **_gdrive_device_state}
file_editor_plus/backend/app.py:3150:    with _gdrive_lock:
file_editor_plus/backend/app.py:3151:        _gdrive_device_state = state
file_editor_plus/backend/app.py:3152:        _gdrive_device_stop = stop_event
file_editor_plus/backend/app.py:3158:def gdrive_device_cancel():
file_editor_plus/backend/app.py:3159:    with _gdrive_lock:
file_editor_plus/backend/app.py:3160:        if _gdrive_device_stop:
file_editor_plus/backend/app.py:3161:            _gdrive_device_stop.set()
file_editor_plus/backend/app.py:3167:def gdrive_disconnect():
file_editor_plus/backend/app.py:3168:    with _gdrive_lock:
file_editor_plus/backend/app.py:3170:    _clear_gdrive_tokens()
file_editor_plus/backend/app.py:3179:def gdrive_backup_manual():
file_editor_plus/backend/app.py:3191:def gdrive_get_schedule():
file_editor_plus/backend/app.py:3192:    cfg = _load_gdrive_schedule()
file_editor_plus/backend/app.py:3194:    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
file_editor_plus/backend/app.py:3199:def gdrive_put_schedule(body: dict):
file_editor_plus/backend/app.py:3242:    _save_gdrive_schedule(cfg)
file_editor_plus/backend/app.py:3244:        _ensure_gdrive_scheduler_started()
file_editor_plus/backend/app.py:3245:    _gdrive_schedule_wake.set()
file_editor_plus/backend/app.py:3246:    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
file_editor_plus/backend/test_gdrive_oauth.py:13:        with app._gdrive_lock:
file_editor_plus/backend/test_gdrive_oauth.py:14:            app._gdrive_oauth_state_store.clear()
file_editor_plus/backend/test_gdrive_oauth.py:15:            app._gdrive_device_state = None
file_editor_plus/backend/test_gdrive_oauth.py:20:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:39:        with app._gdrive_lock:
file_editor_plus/backend/test_gdrive_oauth.py:40:            self.assertTrue(len(app._gdrive_oauth_state_store) == 1)
file_editor_plus/backend/test_gdrive_oauth.py:45:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:64:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:83:            "_resolve_gdrive_oauth_config",
file_editor_plus/backend/test_gdrive_oauth.py:112:        with patch.object(app, "_load_gdrive_tokens", return_value={"access_token": "a", "expires_at": future}), patch.object(
file_editor_plus/backend/test_gdrive_oauth.py:113:            app, "_resolve_gdrive_oauth_config", return_value={"client_id": "cid-test", "client_secret": None, "redirect_uri": None, "client_id_source": "env_default", "client_secret_source": "none"}
file_editor_plus/README.md:45:- `gdrive_client_id` (opzionale)
file_editor_plus/README.md:46:- `gdrive_client_secret` (opzionale)
file_editor_plus/README.md:47:- `gdrive_redirect_uri` (opzionale)
file_editor_plus/README.md:49:Se `gdrive_client_id` non e' impostato nelle opzioni, il backend prova fallback da variabili ambiente:
file_editor_plus/README.md:67:  - `override` (usa `gdrive_redirect_override`)
file_editor_plus/README.md:75:- Errore redirect URI mismatch: imposta `gdrive_redirect_uri` coerente con URL Ingress dell'add-on.
file_editor_plus/README.md:81:| `404 callback` | URI registrata ma callback non raggiunge l'add-on | Configura `public_base_url` o `gdrive_redirect_override` con endpoint raggiungibile |
file_editor_plus/README.md:90:- Opzione 2: usa `gdrive_redirect_override` con URI completa.
AI/AI_RUNBOOK.md:14:  - (Cloud Backup) Google Drive richiede `gdrive_client_id` nelle opzioni dell'add-on (vedi `file_editor_plus/config.yaml` -> `options/schema`).
AI/KNOWLEDGE.yaml:34:    notes: "Ingress abilitato; mount /config:rw; permessi Supervisor/Core API (vedi manifest). Opzioni cloud: `gdrive_client_id`, `gdrive_client_secret`, `gdrive_redirect_uri`, `gdrive_redirect_override`, `public_base_url`, `addon_callback_port`."
AI/KNOWLEDGE.yaml:84:  - id: "context:gdrive_oauth_map"
AI/KNOWLEDGE.yaml:87:    path: "AI/CONTEXT/gdrive_oauth_flow_map.md"
AI/KNOWLEDGE.yaml:90:  - id: "qa:gdrive_smoke"
AI/KNOWLEDGE.yaml:123:    to: "context:gdrive_oauth_map"
AI/KNOWLEDGE.yaml:127:    to: "qa:gdrive_smoke"
AI/KNOWLEDGE.yaml:147:      - "file_editor_plus/backend/test_gdrive_oauth.py"
AI/KNOWLEDGE.yaml:220:    summary: "Aggiunti parametri espliciti per redirect OAuth stabile (`public_base_url`, `addon_callback_port`, `gdrive_redirect_override`) in options add-on e resolver backend."
AI/KNOWLEDGE.yaml:247:      - "file_editor_plus/backend/test_gdrive_oauth.py"
AI/KNOWLEDGE.yaml:323:      - "rg \"gdrive_client_id\" -n file_editor_plus"
AI/KNOWLEDGE.yaml:332:      - "AI/CONTEXT/gdrive_oauth_flow_map.md"
AI/KNOWLEDGE.yaml:548:    summary: "Rivalidate opzioni add-on per Google Drive (`gdrive_client_id`) e documentato prerequisito nel runbook."
AI/KNOWLEDGE.yaml:554:      - "rg -n -S \"gdrive_client_id\" ."
AI/KNOWLEDGE.yaml:556:    notes: "Opzioni add-on: `file_editor_plus/config.yaml` contiene `options/schema` per `gdrive_client_id`. Backend legge da `/data/options.json`."
AI/KNOWLEDGE.yaml:658:    summary: "Decisione credenziali Google Drive: usare add-on options (`gdrive_client_id`) invece di Application Credentials."
AI/DECISIONS.md:71:  - Usare **add-on options** per configurare `gdrive_client_id` (in `file_editor_plus/config.yaml`), senza dipendere da `application_credentials`.
AI/CONTEXT/gdrive_oauth_flow_map.md:11:3. Backend endpoint `gdrive_device_start()` validates `gdrive_client_id` from add-on options (`/data/options.json`).
AI/CONTEXT/gdrive_oauth_flow_map.md:23:  - `_gdrive_device_state`
AI/CONTEXT/gdrive_oauth_flow_map.md:24:  - `_gdrive_device_stop`
AI/CONTEXT/gdrive_oauth_flow_map.md:25:  - `_gdrive_lock`
AI/CONTEXT/gdrive_oauth_flow_map.md:29:  - `gdrive_client_id`
AI/AI_TASKS.md:35:   - `rg -n "gdrive_"`
AI/AI_TASKS.md:58:   - mostrano toast relativi a `gdrive_client_id`, oauth, drive
AI/AI_TASKS.md:118:**Goal:** nessun riferimento attivo a `gdrive_*`, `GDRIVE_OAUTH_*`, `GOOGLE_OAUTH_*` deve rimanere nella config “live” (se non usato da altre feature).
AI/AI_TASKS.md:123:   - `rg -n "gdrive_|GDRIVE_OAUTH|GOOGLE_OAUTH"`
AI/AI_TASKS.md:224:- Nessun riferimento a `gdrive_*` in config attiva.
file_editor_plus/config.yaml:29:  gdrive_client_id: ""
file_editor_plus/config.yaml:30:  gdrive_client_secret: ""
file_editor_plus/config.yaml:31:  gdrive_redirect_uri: ""
file_editor_plus/config.yaml:32:  gdrive_redirect_override: ""
file_editor_plus/config.yaml:37:  gdrive_client_id: str
file_editor_plus/config.yaml:38:  gdrive_client_secret: str
file_editor_plus/config.yaml:39:  gdrive_redirect_uri: str
file_editor_plus/config.yaml:40:  gdrive_redirect_override: str
file_editor_plus/frontend/src/app-root.ts:1059:      const popup = window.open(String(payload.auth_url), "gdrive_oauth", "width=520,height=720");
file_editor_plus/frontend/src/app-root.ts:3757:                              ? "Non configurato (manca gdrive_client_id nelle opzioni add-on)"
```
