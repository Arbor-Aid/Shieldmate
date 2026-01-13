library;

import 'package:firebase_database/firebase_database.dart';

class DefaultConnector {
  static ConnectorConfig connectorConfig = ConnectorConfig(
    'asia-east1',
    'default',
    'arbor_aid_app',
  );

  DefaultConnector({required this.dataConnect});
  static DefaultConnector get instance {
    return DefaultConnector(
        dataConnect: FirebaseDatabase.instanceFor(
            connectorConfig: connectorConfig,
            sdkType: CallerSDKType.generated));
  }

  FirebaseDatabase dataConnect;
}
