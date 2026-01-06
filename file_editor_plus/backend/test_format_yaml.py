import unittest

from app import format_yaml_text


class TestFormatYaml(unittest.TestCase):
    def test_preserve_comments_and_order(self):
        src = "# comment\nkey: value\nb: 2\n"
        out = format_yaml_text(src)
        self.assertTrue(out.startswith("# comment"))
        self.assertIn("key: value", out)
        self.assertIn("b: 2", out)

    def test_list_indent(self):
        src = "items:\n  - a: 1\n    b: 2\n"
        out = format_yaml_text(src)
        self.assertIn("- a: 1", out)

    def test_block_scalar(self):
        src = "note: |\n  line1\n  line2\n"
        out = format_yaml_text(src)
        self.assertIn("note: |", out)
        self.assertIn("line1", out)

    def test_long_line_not_wrapped(self):
        long_line = "x: \"{{ very_long_template_string_that_should_not_be_wrapped_or_split_even_if_it_is_really_long }}\""
        out = format_yaml_text(long_line)
        self.assertIn("{{ very_long_template_string", out)

    def test_invalid_yaml_raises(self):
        with self.assertRaises(Exception):
            format_yaml_text("key: [unbalanced")


if __name__ == "__main__":
    unittest.main()
