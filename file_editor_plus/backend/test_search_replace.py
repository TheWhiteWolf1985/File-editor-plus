import tempfile
import time
import unittest
from pathlib import Path

import app
from app import perform_search, _replace_on_files


class SearchReplaceTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        app.BASE_DIR = Path(self.tmp.name).resolve()
        app.BACKUP_DIR = (app.BASE_DIR / ".fep-backups").resolve()

    def tearDown(self):
        self.tmp.cleanup()

    def _write(self, rel: str, content: str):
        p = app.BASE_DIR / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return p

    def test_search_skips_binary(self):
        bin_path = app.BASE_DIR / "bin.dat"
        bin_path.write_bytes(b"\x00\x01\x02")
        res = perform_search({"query": "a", "case_sensitive": True})
        self.assertEqual(res["summary"]["matches_total"], 0)

    def test_preview_does_not_write(self):
        p = self._write("file.txt", "hello world")
        st = p.stat()
        payload = {
            "query": "world",
            "replace": "home",
            "case_sensitive": True,
            "scope": "files",
            "files": [{"path": "file.txt", "mtime": st.st_mtime}],
        }
        _ = _replace_on_files(payload, apply=False)
        self.assertEqual((app.BASE_DIR / "file.txt").read_text(encoding="utf-8"), "hello world")

    def test_apply_modifies_and_creates_backup(self):
        p = self._write("file.txt", "foo bar foo")
        st = p.stat()
        payload = {
            "query": "foo",
            "replace": "baz",
            "case_sensitive": True,
            "scope": "files",
            "files": [{"path": "file.txt", "mtime": st.st_mtime}],
        }
        res = _replace_on_files(payload, apply=True)
        self.assertEqual((app.BASE_DIR / "file.txt").read_text(encoding="utf-8"), "baz bar baz")
        backup_entries = [e for e in res["per_file"] if e["path"] == "file.txt" and e.get("backup_path")]
        self.assertTrue(backup_entries, "backup path should be returned when modified")
        # backup file exists
        bak_rel = backup_entries[0]["backup_path"]
        self.assertTrue((app.BASE_DIR / bak_rel).exists())

    def test_stale_detection(self):
        p = self._write("stale.txt", "alpha beta")
        st = p.stat()
        # mutate mtime
        time.sleep(0.01)
        p.write_text("alpha gamma", encoding="utf-8")
        payload = {
            "query": "alpha",
            "replace": "delta",
            "case_sensitive": True,
            "scope": "files",
            "files": [{"path": "stale.txt", "mtime": st.st_mtime}],
        }
        res = _replace_on_files(payload, apply=True)
        entry = next(e for e in res["per_file"] if e["path"] == "stale.txt")
        self.assertEqual(entry["status"], "stale")
        # file content unchanged by apply (still gamma variant)
        self.assertEqual((app.BASE_DIR / "stale.txt").read_text(encoding="utf-8"), "alpha gamma")

    def test_traversal_blocked(self):
        with self.assertRaises(Exception):
            _replace_on_files(
                {
                    "query": "x",
                    "replace": "y",
                    "case_sensitive": True,
                    "scope": "files",
                    "files": [{"path": "../evil.txt", "mtime": 0}],
                },
                apply=True,
            )


if __name__ == "__main__":
    unittest.main()
