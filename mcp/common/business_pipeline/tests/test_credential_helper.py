from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[4]
HELPER = REPO_ROOT / "scripts" / "load_business_pipeline_credentials.ps1"


class CredentialHelperTests(unittest.TestCase):
    def test_helper_is_prompt_only_process_local_and_value_silent(self):
        source = HELPER.read_text(encoding="utf-8")
        self.assertIn("Read-Host", source)
        self.assertIn("-AsSecureString", source)
        self.assertIn("EnvironmentVariableTarget]::Process", source)
        self.assertIn("COMTRADE_SECONDARY_API_KEY", source)
        self.assertIn("[bool][Environment]::GetEnvironmentVariable", source)
        self.assertNotIn("EnvironmentVariableTarget]::User", source)
        self.assertNotIn("EnvironmentVariableTarget]::Machine", source)
        for forbidden in ("Out-File", "Set-Content", "Add-Content", "Export-Clixml"):
            self.assertNotIn(forbidden, source)

    def test_helper_requires_dot_sourcing_and_manual_secondary_opt_in(self):
        source = HELPER.read_text(encoding="utf-8")
        self.assertIn("$MyInvocation.InvocationName -ne '.'", source)
        self.assertIn("[switch]$IncludeSecondary", source)
        self.assertIn("if ($IncludeSecondary)", source)


if __name__ == "__main__":
    unittest.main()
