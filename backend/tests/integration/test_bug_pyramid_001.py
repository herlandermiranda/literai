"""
Tests d'intégration pour BUG-PYRAMID-001
========================================

Bug: 404 sur création de nœud pyramidal
Cause: Duplicate route prefix /pyramid/pyramid
Solution: Suppression du prefix /pyramid dans pyramid.py

Ces tests vérifient que la route correcte /api/v1/pyramid/nodes est utilisée
et que la route incorrecte /api/v1/pyramid/pyramid/nodes n'existe pas.
"""

import pytest


def test_create_pyramid_node_correct_route(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec route correcte
    
    Vérifie que POST /api/v1/pyramid/nodes/ fonctionne correctement
    (pas /api/v1/pyramid/pyramid/nodes/).
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",  # Route correcte
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 1,
            "content": "Test node content for BUG-PYRAMID-001",
            "title": "Test Pyramid Node"
        }
    )
    # Vérifier le code de statut (201 Created)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    
    # Vérifier les données retournées
    data = response.json()
    assert data["title"] == "Test Pyramid Node"
    assert data["level"] == 1
    assert data["content"] == "Test node content for BUG-PYRAMID-001"
    assert data["project_id"] == str(test_project.id)
    assert "id" in data


def test_pyramid_node_route_not_duplicated(client, test_user_token, test_project, db):
    """
    Test que la route /pyramid/pyramid/nodes n'existe pas
    
    Vérifie que le bug BUG-PYRAMID-001 est corrigé : la route dupliquée
    /api/v1/pyramid/pyramid/nodes/ ne doit pas exister.
    """
    response = client.post(
        "/api/v1/pyramid/pyramid/nodes/",  # Route incorrecte (dupliquée)
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 1,
            "content": "This should fail",
            "title": "Duplicate Route Test"
        }
    )
    
    # Doit retourner 404 car la route n'existe pas
    assert response.status_code == 404, f"Expected 404, got {response.status_code}. BUG-PYRAMID-001 not fixed!"


def test_get_pyramid_nodes_correct_route(client, test_user_token, test_project, db):
    """
    Test récupération des nœuds pyramidaux avec route correcte
    
    Vérifie que GET /api/v1/pyramid/nodes fonctionne correctement.
    """
    response = client.get(
        f"/api/v1/pyramid/nodes?project_id={test_project.id}",  # Route correcte
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Vérifier le code de statut
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    # Vérifier que c'est une liste
    data = response.json()
    assert isinstance(data, list)


def test_get_pyramid_nodes_route_not_duplicated(client, test_user_token, test_project, db):
    """
    Test que la route GET /pyramid/pyramid/nodes n'existe pas
    
    Vérifie que la route dupliquée n'existe pas pour GET non plus.
    """
    response = client.get(
        f"/api/v1/pyramid/pyramid/nodes?project_id={test_project.id}",  # Route incorrecte
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Doit retourner 404
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"


def test_create_pyramid_node_without_auth_returns_401(client, test_project, db):
    """
    Test création de nœud pyramidal sans authentification (doit retourner 401)
    
    Vérifie que l'endpoint est bien protégé.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        json={
            "project_id": str(test_project.id),
            "level": 1,
            "content": "Unauthorized",
            "title": "Unauthorized Node"
        }
    )
    
    # FastAPI retourne 403 (Forbidden) quand il n'y a pas de token
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"


def test_create_pyramid_node_with_invalid_project_id_returns_404(client, test_user_token, db):
    """
    Test création de nœud pyramidal avec project_id invalide (doit retourner 404)
    
    Vérifie que l'endpoint valide l'existence du projet.
    """
    import uuid
    fake_project_id = str(uuid.uuid4())
    
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": fake_project_id,
            "level": 1,
            "content": "Invalid project",
            "title": "Invalid Project Node"
        }
    )
    
    # Doit retourner 404 (projet non trouvé)
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
