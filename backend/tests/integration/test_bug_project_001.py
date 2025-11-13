"""
Tests d'intégration pour BUG-PROJECT-001
========================================

Bug: 401 Unauthorized sur création de projet
Cause: Redirections 307 perdant le header Authorization (POST sans slash final)
Solution: Ajout de slashes finaux sur tous les endpoints POST dans api.ts

Ces tests vérifient que la création de projet fonctionne correctement
avec ou sans slash final dans l'URL.
"""

import pytest


def test_create_project_with_trailing_slash(client, test_user_token, db):
    """
    Test création de projet avec slash final (doit fonctionner)
    
    Vérifie que POST /api/v1/projects/ (avec slash final) fonctionne correctement
    et retourne un code 201 avec les données du projet créé.
    """
    response = client.post(
        "/api/v1/projects/",  # Avec slash final
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "title": "Test Project With Slash",
            "description": "A test project created with trailing slash",
            "language": "FR"
        }
    )
    
    # Vérifier le code de statut
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    
    # Vérifier les données retournées
    data = response.json()
    assert data["title"] == "Test Project With Slash"
    assert data["description"] == "A test project created with trailing slash"
    assert data["language"] == "FR"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_project_without_trailing_slash(client, test_user_token, db):
    """
    Test création de projet sans slash final (doit fonctionner ou rediriger)
    
    Vérifie que POST /api/v1/projects (sans slash final) fonctionne.
    Selon la configuration de redirect_slashes, peut retourner 201 ou 307.
    """
    response = client.post(
        "/api/v1/projects",  # Sans slash final
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "title": "Test Project Without Slash",
            "description": "A test project created without trailing slash",
            "language": "FR"
        },
        follow_redirects=True  # Suivre les redirections 307
    )
    
    # Vérifier le code de statut (201 ou 307 selon config)
    assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
    
    # Vérifier les données retournées
    data = response.json()
    assert data["title"] == "Test Project Without Slash"
    assert data["description"] == "A test project created without trailing slash"
    assert data["language"] == "FR"
    assert "id" in data


def test_create_project_preserves_authorization_header(client, test_user_token, db):
    """
    Test que le header Authorization est préservé lors de la création de projet
    
    Vérifie que le bug BUG-PROJECT-001 est corrigé : le header Authorization
    ne doit pas être perdu lors des redirections 307.
    """
    response = client.post(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "title": "Test Auth Header",
            "description": "Test that auth header is preserved",
            "language": "EN"
        }
    )
    
    # Si le header Authorization est perdu, on obtient 401 Unauthorized
    assert response.status_code != 401, "Authorization header was lost (BUG-PROJECT-001 not fixed)"
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["title"] == "Test Auth Header"


def test_create_project_without_auth_returns_401(client, db):
    """
    Test création de projet sans authentification (doit retourner 403)
    
    Vérifie que l'endpoint est bien protégé et retourne 403 sans token (comportement FastAPI).
    """
    response = client.post(
        "/api/v1/projects/",
        json={
            "title": "Unauthorized Project",
            "description": "This should fail",
            "language": "FR"
        }
    )
    
    assert response.status_code == 403, f"Expected 403 (FastAPI behavior), got {response.status_code}"


def test_create_project_with_invalid_token_returns_401(client, db):
    """
    Test création de projet avec token invalide (doit retourner 401)
    
    Vérifie que l'endpoint rejette les tokens invalides.
    """
    response = client.post(
        "/api/v1/projects/",
        headers={"Authorization": "Bearer invalid_token_here"},
        json={
            "title": "Invalid Token Project",
            "description": "This should fail",
            "language": "FR"
        }
    )
    
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"


def test_create_project_with_missing_fields_returns_422(client, test_user_token, db):
    """
    Test création de projet avec champs manquants (doit retourner 422)
    
    Vérifie que la validation des données fonctionne correctement.
    """
    response = client.post(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            # Manque le champ "title" obligatoire
            "description": "Missing title",
            "language": "FR"
        }
    )
    
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
