import os
from google.cloud import firestore

_client = None

def get_firestore_client():
    global _client
    if _client is not None:
        return _client
    # Supports FIRESTORE_EMULATOR_HOST automatically via google-cloud-firestore.
    _client = firestore.Client()
    return _client
