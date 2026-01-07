import unittest

from fastapi import HTTPException

from app import compute_diff, MAX_DIFF_SIZE


class TestDiff(unittest.TestCase):
    def test_simple_insert(self):
        base = "a\nb\nc\n"
        modified = "a\nb\nx\nc\n"
        res = compute_diff(base, modified)
        summary = res["summary"]
        self.assertEqual(summary["added"], 1)
        self.assertEqual(summary["removed"], 0)
        self.assertEqual(summary["changed"], 0)
        self.assertTrue(any(h["type"] == "insert" for h in res["hunks"]))

    def test_crlf_normalized(self):
        base = "a\r\nb\r\nc\r\n"
        modified = "a\nb\nc\n"
        res = compute_diff(base, modified)
        summary = res["summary"]
        self.assertEqual(summary["added"], 0)
        self.assertEqual(summary["removed"], 0)
        self.assertEqual(summary["changed"], 0)

    def test_size_limit(self):
        huge = "a" * (MAX_DIFF_SIZE + 1)
        with self.assertRaises(HTTPException) as ctx:
            compute_diff(huge, "x")
        self.assertEqual(ctx.exception.status_code, 413)


if __name__ == "__main__":
    unittest.main()
