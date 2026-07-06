"""
Backend API test suite for Damien Boyle Interiors.
Tests: projects (public + admin CRUD), bookings, auth, uploads, chat.
"""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://kylie-interiors.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "damien@boyleinteriors.com"
ADMIN_PASSWORD = "Damien2026!"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    resp = api_client.post(f"{API}/auth/login",
                           json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text}"
    data = resp.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- health ----------
class TestHealth:
    def test_api_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert "Damien Boyle" in r.json().get("message", "")


# ---------- auth ----------
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login",
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["token_type"] == "bearer"
        assert d["user"]["email"] == ADMIN_EMAIL
        assert isinstance(d["access_token"], str) and len(d["access_token"]) > 20

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{API}/auth/login",
                            json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_with_token(self, api_client, auth_headers):
        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, api_client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- projects ----------
class TestProjects:
    def test_list_projects_public(self, api_client):
        r = api_client.get(f"{API}/projects")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Expected seeded projects"
        p = data[0]
        assert "id" in p and "title" in p and "category" in p

    def test_list_featured_only(self, api_client):
        r = api_client.get(f"{API}/projects", params={"featured": "true"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for p in data:
            assert p["featured"] is True

    def test_get_project_by_id(self, api_client):
        listing = api_client.get(f"{API}/projects").json()
        assert len(listing) > 0
        pid = listing[0]["id"]
        r = api_client.get(f"{API}/projects/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_get_project_404(self, api_client):
        r = api_client.get(f"{API}/projects/nonexistent-{uuid.uuid4()}")
        assert r.status_code == 404

    def test_create_project_unauthenticated(self, api_client):
        r = requests.post(f"{API}/projects",
                          json={"title": "TEST_x", "category": "Residential"})
        assert r.status_code == 401

    def test_project_crud_lifecycle(self, api_client, auth_headers):
        # CREATE
        payload = {"title": "TEST_Project Zeta", "category": "Kitchen",
                   "location": "TestVille", "year": "2026",
                   "description": "test desc", "featured": True}
        r = requests.post(f"{API}/projects", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == payload["title"]
        assert created["featured"] is True
        pid = created["id"]

        # GET verifies persistence
        r2 = api_client.get(f"{API}/projects/{pid}")
        assert r2.status_code == 200
        assert r2.json()["title"] == payload["title"]

        # UPDATE
        r3 = requests.put(f"{API}/projects/{pid}",
                          json={"title": "TEST_Project Zeta Updated", "featured": False},
                          headers=auth_headers)
        assert r3.status_code == 200
        assert r3.json()["title"] == "TEST_Project Zeta Updated"
        assert r3.json()["featured"] is False

        # verify update persisted
        r4 = api_client.get(f"{API}/projects/{pid}")
        assert r4.json()["title"] == "TEST_Project Zeta Updated"

        # DELETE
        r5 = requests.delete(f"{API}/projects/{pid}", headers=auth_headers)
        assert r5.status_code == 200

        # verify deletion
        r6 = api_client.get(f"{API}/projects/{pid}")
        assert r6.status_code == 404


# ---------- bookings ----------
class TestBookings:
    created_id = None

    def test_create_booking_public(self, api_client):
        payload = {"name": "TEST User", "email": "test_booking@example.com",
                   "message": "Interested in a consultation.", "source": "contact_form"}
        r = api_client.post(f"{API}/bookings", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email"] == payload["email"]
        assert d["status"] == "new"
        assert d["source"] == "contact_form"
        TestBookings.created_id = d["id"]

    def test_list_bookings_no_auth(self, api_client):
        r = requests.get(f"{API}/bookings")
        assert r.status_code == 401

    def test_list_bookings_with_auth(self, api_client, auth_headers):
        r = requests.get(f"{API}/bookings", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert any(b["id"] == TestBookings.created_id for b in r.json())

    def test_update_booking_status(self, api_client, auth_headers):
        assert TestBookings.created_id
        r = requests.put(f"{API}/bookings/{TestBookings.created_id}",
                         json={"status": "contacted"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "contacted"

    def test_cleanup_booking(self, api_client, auth_headers):
        if TestBookings.created_id:
            requests.delete(f"{API}/bookings/{TestBookings.created_id}", headers=auth_headers)


# ---------- upload ----------
class TestUpload:
    def test_upload_requires_auth(self, api_client):
        r = requests.post(f"{API}/upload", files={"file": ("t.png", b"x", "image/png")})
        assert r.status_code == 401

    def test_upload_and_fetch(self, api_client, auth_headers):
        # 1x1 png
        png_bytes = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
                     b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05"
                     b"\xfe\x02\xfe\xa4\x9f\xdc9\x00\x00\x00\x00IEND\xaeB`\x82")
        files = {"file": ("test_pixel.png", io.BytesIO(png_bytes), "image/png")}
        r = requests.post(f"{API}/upload", files=files, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and "path" in d
        # fetch via /api/files/{path}
        full = f"{BASE_URL}{d['url']}"
        g = requests.get(full)
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("image/")
        assert len(g.content) > 0


# ---------- chat ----------
class TestChat:
    def test_chat_returns_reply(self, api_client):
        """Kylie should return an HTTP 200 with a non-empty 'reply' string via Mistral."""
        payload = {"session_id": f"test-{uuid.uuid4()}", "message": "Hi Kylie, what services do you offer?"}
        r = api_client.post(f"{API}/chat", json=payload, timeout=60)
        assert r.status_code == 200, f"Unexpected status {r.status_code}: {r.text[:300]}"
        j = r.json()
        assert "reply" in j and isinstance(j["reply"], str) and len(j["reply"]) > 10

    def test_chat_pricing_not_quoted(self, api_client):
        """When asked about renovation cost, Kylie must NOT include dollar figures or price numbers."""
        payload = {"session_id": f"test-{uuid.uuid4()}",
                   "message": "What services do you offer and how much does a full home renovation cost?"}
        r = api_client.post(f"{API}/chat", json=payload, timeout=60)
        assert r.status_code == 200, f"Unexpected status {r.status_code}: {r.text[:300]}"
        reply = r.json().get("reply", "")
        assert reply, "Empty reply"
        # No dollar signs or specific numeric price figures
        assert "$" not in reply, f"Reply contains $ sign: {reply}"
        import re
        # forbid numbers like 250, 2500, 15000, 100k etc.
        # allow ordinal single/double digits used in process steps ("1)", "2.") but forbid larger figures
        big_numbers = re.findall(r"\b\d{3,}\b", reply)
        assert not big_numbers, f"Reply contains price-like numbers {big_numbers}: {reply}"
        # forbid explicit price/dollar words
        lowered = reply.lower()
        for w in ["usd", "aud ", "$aud", "dollars", "per hour", "flat fee"]:
            assert w not in lowered, f"Reply contains pricing word '{w}': {reply}"

    def test_chat_lead_capture(self, api_client, auth_headers):
        sid = f"test-{uuid.uuid4()}"
        r = api_client.post(f"{API}/chat/lead",
                            json={"session_id": sid, "name": "TEST Lead",
                                  "email": "test_lead@example.com",
                                  "message": "Interested via kylie"})
        assert r.status_code == 200
        assert r.json()["ok"] is True
        bid = r.json()["booking_id"]

        # verify booking exists with kylie_chat source
        listing = requests.get(f"{API}/bookings", headers=auth_headers).json()
        match = [b for b in listing if b["id"] == bid]
        assert len(match) == 1
        assert match[0]["source"] == "kylie_chat"
        assert match[0]["email"] == "test_lead@example.com"

        # cleanup
        requests.delete(f"{API}/bookings/{bid}", headers=auth_headers)
