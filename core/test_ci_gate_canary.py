from django.test import SimpleTestCase


class DeliberateCIGateCanary(SimpleTestCase):
    def test_failing_checks_block_integration(self):
        self.fail('Deliberate CI gate canary; this disposable pull request must never merge')
