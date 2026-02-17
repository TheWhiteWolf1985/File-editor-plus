import tempfile
import unittest
from pathlib import Path

from fastapi import HTTPException

import app
from app import safe_path, make_backup, atomic_write


class TestFsPrimitives(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        app.BASE_DIR = Path(self.tmp.name).resolve()
        app.BACKUP_DIR = (app.BASE_DIR / ".fep-backups").resolve()

    def tearDown(self):
        self.tmp.cleanup()

    def test_safe_path_allows_relative(self):
        p = safe_path("subdir/file.yaml")
        self.assertEqual(p, (app.BASE_DIR / "subdir/file.yaml").resolve())

    def test_safe_path_normalizes_backslashes_and_trims(self):
        p = safe_path("  subdir\\file.yaml  ")
        self.assertEqual(p, (app.BASE_DIR / "subdir/file.yaml").resolve())

    def test_safe_path_blocks_null_byte(self):
        with self.assertRaises(HTTPException) as ctx:
            safe_path("evil\x00.yaml")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_safe_path_blocks_absolute_and_home(self):
        for rel in ("/etc/passwd", "~/.ssh/id_rsa"):
            with self.assertRaises(HTTPException) as ctx:
                safe_path(rel)
            self.assertEqual(ctx.exception.status_code, 400)

    def test_safe_path_blocks_traversal(self):
        with self.assertRaises(HTTPException) as ctx:
            safe_path("../evil.yaml")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_make_backup_returns_none_for_missing(self):
        p = (app.BASE_DIR / "missing.txt").resolve()
        self.assertIsNone(make_backup(p))

    def test_make_backup_creates_backup_file(self):
        target = (app.BASE_DIR / "a/b/c.txt").resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("hello", encoding="utf-8")

        bak = make_backup(target)
        self.assertIsNotNone(bak)
        self.assertTrue(bak.exists())
        self.assertTrue(str(bak).startswith(str(app.BACKUP_DIR)))
        self.assertEqual(bak.read_text(encoding="utf-8"), "hello")

    def test_atomic_write_creates_or_overwrites(self):
        p = (app.BASE_DIR / "x.txt").resolve()
        atomic_write(p, "one\n")
        self.assertEqual(p.read_text(encoding="utf-8"), "one\n")

        atomic_write(p, "two\n")
        self.assertEqual(p.read_text(encoding="utf-8"), "two\n")

        # No leftover tmp files matching the naming scheme.
        leftovers = list(p.parent.glob(f".{p.name}.tmp.*"))
        self.assertEqual(leftovers, [])


if __name__ == "__main__":
    unittest.main()

