from google.cloud import firestore
import uuid
import os

# Initialize Firestore client
# When GOOGLE_APPLICATION_CREDENTIALS is set in the environment (like on Render),
# the client will automatically use it. No need for manual path handling.
try:
    db = firestore.Client()
except Exception as e:
    print(f"FATAL: Firestore initialization failed. This is likely a credential issue.")
    print(f"Error: {e}")
    # A fallback for local development if the env var isn't set.
    # Ensure legal-firebase.json is in the `backend` directory for this to work locally.
    local_credentials_path = os.path.join(os.path.dirname(__file__), '../../legal-firebase.json')
    if os.path.exists(local_credentials_path):
        print("Attempting to fall back to local credentials file...")
        db = firestore.Client.from_service_account_json(local_credentials_path)
    else:
        # Re-raise the exception if no credentials can be found at all.
        raise e

def save_user(name, email, password):
    user_id = str(uuid.uuid4())
    db.collection("users").document(user_id).set({
        "name": name,
        "email": email,
        "password": password
    })
    return user_id

def get_user(user_id):
    doc = db.collection("users").document(user_id).get()
    return doc.to_dict() if doc.exists else None

def save_document_summary(user_id, doc_id, doc_name, summary_json):
    db.collection("documents").document(doc_id).set({
        "user_id": user_id,
        "doc_id": doc_id,
        "doc_name": doc_name,
        "summary": summary_json,
        "upload_date": firestore.SERVER_TIMESTAMP
    })

def get_documents_by_user_id(user_id):
    if not user_id:
        return []
    docs_ref = db.collection("documents")
    query = docs_ref.where("user_id", "==", user_id).stream()
    documents = []
    for doc in query:
        data = doc.to_dict()
        documents.append({
            "doc_id": data.get("doc_id"),
            "doc_name": data.get("doc_name"),
            "summary": data.get("summary"),
            "upload_date": data.get("upload_date")
        })
    return documents

def get_user_by_email(email):
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", email).limit(1).stream()
    for doc in query:
        user = doc.to_dict()
        user["id"] = doc.id
        return user
    return None