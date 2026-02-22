# Snapshot removed from file_editor_plus/backend/app.py
# Archived during CLOUD-ARCHIVE-STEP-003

@app.get("/api/cloud/gdrive/status")
def gdrive_status():
    oauth_cfg = _resolve_gdrive_oauth_config()
    tokens = _load_gdrive_tokens()
    with _gdrive_lock:
        state = dict(_gdrive_device_state) if _gdrive_device_state else None
    return {
        "ok": True,
        "configured": bool(oauth_cfg.get("client_id")),
        "oauth_client_source": oauth_cfg.get("client_id_source"),
        "connected": _is_gdrive_connected(tokens),
        "device_flow": state,
    }


@app.get("/api/cloud/gdrive/oauth/start")
def gdrive_oauth_start(request: Request):
    oauth_cfg = _resolve_gdrive_oauth_config()
    client_id = oauth_cfg.get("client_id")
    if not client_id:
        raise HTTPException(503, "Manca gdrive_client_id (opzioni add-on o fallback env)")

    redirect_uri, mode = _resolve_stable_redirect_uri(request, oauth_cfg)
    if not _is_valid_redirect_uri(str(redirect_uri)):
        raise HTTPException(400, "OAuth redirect_uri non valida")
    state = secrets.token_urlsafe(32)
    verifier, challenge = _build_gdrive_pkce_pair()
    expires_at = int(time.time()) + GDRIVE_OAUTH_STATE_TTL_SECONDS

    _cleanup_gdrive_oauth_states()
    with _gdrive_lock:
        _gdrive_oauth_state_store[state] = {
            "code_verifier": verifier,
            "redirect_uri": redirect_uri,
            "expires_at": expires_at,
            "used": False,
        }

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/drive.file",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    logger.info("gdrive_oauth_start mode=%s redirect_uri=%s", mode, redirect_uri)
    return {"ok": True, "auth_url": auth_url, "redirect_uri": redirect_uri, "mode": mode, "expires_at": expires_at}


@app.get("/api/cloud/gdrive/oauth/callback", response_class=HTMLResponse)
def gdrive_oauth_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    global _gdrive_device_state
    _cleanup_gdrive_oauth_states()

    if error:
        return HTMLResponse(
            f"""<!doctype html><html><body style="font-family:sans-serif;padding:16px;">
            <h3>Google Drive: autorizzazione negata</h3>
            <p>Dettaglio: {error}</p>
            <script>setTimeout(()=>window.close(),1200);</script>
            </body></html>""",
            status_code=400,
        )

    if not state or not code:
        raise HTTPException(400, "OAuth callback incompleto")

    with _gdrive_lock:
        state_data = _gdrive_oauth_state_store.get(state)
        if not state_data:
            raise HTTPException(400, "OAuth state non valido o scaduto")
        if bool(state_data.get("used")):
            raise HTTPException(400, "OAuth state già utilizzato")
        if int(state_data.get("expires_at") or 0) <= int(time.time()):
            _gdrive_oauth_state_store.pop(state, None)
            raise HTTPException(400, "OAuth state scaduto")
        state_data = dict(state_data)
        _gdrive_oauth_state_store[state]["used"] = True

    oauth_cfg = _resolve_gdrive_oauth_config()
    client_id = oauth_cfg.get("client_id")
    if not client_id:
        with _gdrive_lock:
            _gdrive_oauth_state_store.pop(state, None)
        raise HTTPException(503, "OAuth non configurato: client_id mancante")

    token_redirect_uri = str(state_data.get("redirect_uri") or "").strip()
    if not token_redirect_uri:
        with _gdrive_lock:
            _gdrive_oauth_state_store.pop(state, None)
        raise HTTPException(400, "OAuth state incompleto: redirect_uri mancante (riavvia il flow da Connetti)")
    if not _is_valid_redirect_uri(str(token_redirect_uri)):
        with _gdrive_lock:
            _gdrive_oauth_state_store.pop(state, None)
        raise HTTPException(400, "OAuth redirect_uri non valida")

    token_payload = {
        "client_id": client_id,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": token_redirect_uri,
        "code_verifier": state_data.get("code_verifier") or "",
    }
    client_secret = oauth_cfg.get("client_secret")
    if client_secret:
        token_payload["client_secret"] = client_secret

    try:
        payload = _oauth_post_form("https://oauth2.googleapis.com/token", token_payload)
        access_token = payload.get("access_token")
        if not access_token:
            raise HTTPException(502, "Token response incompleta: access_token mancante")
        refresh_token = payload.get("refresh_token")
        existing = _load_gdrive_tokens() or {}
        now = int(time.time())
        expires_in = int(payload.get("expires_in") or 3600)
        merged = dict(existing)
        merged.update(
            {
                "access_token": access_token,
                "expires_at": now + expires_in,
                "token_type": payload.get("token_type") or "Bearer",
                "scope": payload.get("scope") or merged.get("scope") or "drive.file",
            }
        )
        if refresh_token:
            merged["refresh_token"] = refresh_token
        _save_gdrive_tokens(merged)
    finally:
        with _gdrive_lock:
            _gdrive_oauth_state_store.pop(state, None)

    with _gdrive_lock:
        _gdrive_device_state = {"status": "connected", "source": "oauth_callback", "at": int(time.time())}

    return HTMLResponse(
        """<!doctype html><html><body style="font-family:sans-serif;padding:16px;">
        <h3>Google Drive connesso</h3>
        <p>Puoi chiudere questa finestra e tornare all'add-on.</p>
        <script>setTimeout(()=>window.close(),1200);</script>
        </body></html>"""
    )


@app.post("/api/cloud/gdrive/device/start")
def gdrive_device_start():
    global _gdrive_device_state, _gdrive_device_stop
    oauth_cfg = _resolve_gdrive_oauth_config()
    cid = oauth_cfg.get("client_id")
    if not cid:
        raise HTTPException(503, "Manca gdrive_client_id nelle opzioni add-on")

    with _gdrive_lock:
        if _gdrive_device_state and _gdrive_device_state.get("status") in ("pending", "slow_down"):
            return {"ok": True, **_gdrive_device_state}

    payload = _oauth_post_form(
        "https://oauth2.googleapis.com/device/code",
        {"client_id": cid, "scope": "https://www.googleapis.com/auth/drive.file"},
    )
    device_code = payload.get("device_code")
    user_code = payload.get("user_code")
    verification_url = payload.get("verification_url") or payload.get("verification_uri")
    expires_in = int(payload.get("expires_in") or 900)
    interval = int(payload.get("interval") or 5)
    if not device_code or not user_code or not verification_url:
        raise HTTPException(502, "Google device flow response incomplete")

    expires_at = int(time.time()) + expires_in
    state = {
        "status": "pending",
        "user_code": user_code,
        "verification_url": verification_url,
        "expires_at": expires_at,
        "interval": interval,
    }

    stop_event = threading.Event()
    thread = threading.Thread(
        target=_device_flow_poll_loop,
        args=(cid, str(device_code), interval, expires_at, stop_event),
        daemon=True,
        name="gdrive-device-flow",
    )
    with _gdrive_lock:
        _gdrive_device_state = state
        _gdrive_device_stop = stop_event
    thread.start()
    return {"ok": True, **state}


@app.post("/api/cloud/gdrive/device/cancel")
def gdrive_device_cancel():
    with _gdrive_lock:
        if _gdrive_device_stop:
            _gdrive_device_stop.set()
        _stop_device_flow_locked()
    return {"ok": True}


@app.post("/api/cloud/gdrive/disconnect")
def gdrive_disconnect():
    with _gdrive_lock:
        _stop_device_flow_locked()
    _clear_gdrive_tokens()
    try:
        GDRIVE_CONFIG_FILE.unlink(missing_ok=True)
    except Exception:
        pass
    return {"ok": True}


@app.post("/api/cloud/gdrive/backup")
def gdrive_backup_manual():
    access = _get_access_token_or_503()
    folder_id = _ensure_backup_folder(access)
    zip_path, filename = _zip_config_dir()
    try:
        uploaded = _upload_zip_to_drive(access, folder_id, zip_path, filename)
    finally:
        zip_path.unlink(missing_ok=True)
    return {"ok": True, "file": uploaded, "folder_id": folder_id}


@app.get("/api/cloud/gdrive/schedule")
def gdrive_get_schedule():
    cfg = _load_gdrive_schedule()
    enabled = bool(cfg.get("enabled"))
    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
    return {"ok": True, **cfg, "next_run": next_run}


@app.put("/api/cloud/gdrive/schedule")
def gdrive_put_schedule(body: dict):
    if not isinstance(body, dict):
        raise HTTPException(400, "Invalid JSON body")
    enabled = bool(body.get("enabled"))
    mode = str(body.get("mode") or "daily").strip().lower() or "daily"
    if mode not in ("hourly", "daily", "weekly", "monthly"):
        raise HTTPException(400, "Invalid schedule mode")

    # Back-compat: accept legacy keys `time` and `retention`.
    at_time = str(body.get("at_time") or body.get("time") or "03:00")
    if mode != "hourly":
        _parse_hhmm(at_time)  # validate

    hour_interval = int(body.get("hour_interval") or 1)
    if mode == "hourly":
        hour_interval = max(1, min(24, hour_interval))
    else:
        hour_interval = 1

    weekday = str(body.get("weekday") or "mon").strip().lower()
    if mode == "weekly" and weekday not in ("mon", "tue", "wed", "thu", "fri", "sat", "sun"):
        raise HTTPException(400, "Invalid weekday")
    if mode != "weekly":
        weekday = "mon"

    monthday = int(body.get("monthday") or 1)
    if mode == "monthly":
        monthday = max(1, min(28, monthday))
    else:
        monthday = 1

    retention_count = int(body.get("retention_count") or body.get("retention") or 0)
    retention_count = max(0, min(200, retention_count))

    cfg = {
        "enabled": enabled,
        "mode": mode,
        "hour_interval": hour_interval,
        "at_time": at_time,
        "weekday": weekday,
        "monthday": monthday,
        "retention_count": retention_count,
    }
    _save_gdrive_schedule(cfg)
    if enabled:
        _ensure_gdrive_scheduler_started()
    _gdrive_schedule_wake.set()
    next_run = _compute_next_run_iso_for_cfg(cfg, last_run_epoch=_gdrive_last_auto_run) if enabled else None
    return {"ok": True, **cfg, "next_run": next_run}
