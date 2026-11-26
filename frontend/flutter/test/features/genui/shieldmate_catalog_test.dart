import 'package:arbor_aid_app/features/genui/catalog/shieldmate_catalog.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('onboarding catalog exposes only the approved bounded components', () {
    final catalog = shieldMateCatalog();
    final names = catalog.components.keys.toSet();

    expect(catalog.id, shieldMateCatalogId);
    expect(names, shieldMateOnboardingComponents);
  });
}
