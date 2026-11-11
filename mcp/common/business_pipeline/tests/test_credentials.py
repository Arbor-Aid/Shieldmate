from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.credentials import (
    MissingRuntimeCredential,
    credential_presence_report,
    require_runtime_credential,
)


class CredentialTests(unittest.TestCase):
    def test_presence_report_contains_booleans_not_values(self):
        environment = {"SAM_API_KEY": "secret-sam", "CENSUS_API_KEY": ""}
        report = credential_presence_report("SAM_API_KEY", "CENSUS_API_KEY", environ=environment)
        self.assertEqual(report, {"SAM_API_KEY": True, "CENSUS_API_KEY": False})
        self.assertNotIn("secret-sam", repr(report))

    def test_missing_error_names_variable_without_secret(self):
        with self.assertRaises(MissingRuntimeCredential) as caught:
            require_runtime_credential("COMTRADE_API_KEY", environ={})
        self.assertEqual(str(caught.exception), "COMTRADE_API_KEY is unavailable in the current process environment")


if __name__ == "__main__":
    unittest.main()
