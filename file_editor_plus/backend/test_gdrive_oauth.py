import time
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import app


class GdriveOauthTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app.app)
        with app._gdrive_lock:
            app._gdrive_oauth_state_store.clear()
            app._gdrive_device_state = None

    def test_oauth_start_returns_auth_url_and_state_is_stored(self):
        with patch.object(
            app,
            "_resolve_gdrive_oauth_config",
            return_value={
                "client_id": "cid-test",
                "client_secret": "secret-test",
                "redirect_uri": "http://testserver/api/cloud/gdrive/oauth/callback",
                "client_id_source": "env_default",
                "client_secret_source": "env_default",
            },
        ):
            res = self.client.get("/api/cloud/gdrive/oauth/start")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("ok"))
        auth_url = data.get("auth_url") or ""
        self.assertIn("accounts.google.com/o/oauth2/v2/auth", auth_url)
        self.assertIn("state=", auth_url)
        with app._gdrive_lock:
            self.assertTrue(len(app._gdrive_oauth_state_store) == 1)

    def test_oauth_callback_rejects_invalid_state(self):
        res = self.client.get("/api/cloud/gdrive/oauth/callback?code=test-code&state=invalid-state")
        self.assertEqual(res.status_code, 400)

    def test_status_connected_with_valid_access_token(self):
        future = int(time.time()) + 600
        with patch.object(app, "_load_gdrive_tokens", return_value={"access_token": "a", "expires_at": future}), patch.object(
            app, "_resolve_gdrive_oauth_config", return_value={"client_id": "cid-test", "client_secret": None, "redirect_uri": None, "client_id_source": "env_default", "client_secret_source": "none"}
        ):
            res = self.client.get("/api/cloud/gdrive/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("connected"))


if __name__ == "__main__":
    unittest.main()
