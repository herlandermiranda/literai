"""
Tests d'intégration pour BUG-PYRAMID-002
========================================

Bug: 422 validation error sur création de nœud pyramidal
Cause: Type mismatch (level: string vs int)
Solution: Conversion level string→int dans PyramidView.tsx

Ces tests vérifient que le champ "level" accepte uniquement des entiers
et rejette les strings.
"""

import pytest


def test_create_pyramid_node_with_int_level(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level en int (doit fonctionner)
    
    Vérifie que le champ "level" accepte un entier (0, 1, ou 2).
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 1,  # Int (valide)
            "content": "Test node with int level",
            "title": "Int Level Node"
        }
    )
    
    # Vérifier le code de statut
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    
    # Vérifier les données retournées
    data = response.json()
    assert data["level"] == 1
    assert isinstance(data["level"], int), "Level should be an integer"
    assert data["title"] == "Int Level Node"


def test_create_pyramid_node_with_level_0(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level=0 (high)
    
    Vérifie que level=0 (high) est accepté.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 0,  # High level
            "content": "High level node",
            "title": "High Level Node"
        }
    )
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["level"] == 0


def test_create_pyramid_node_with_level_2(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level=2 (low)
    
    Vérifie que level=2 (low) est accepté.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 2,  # Low level
            "content": "Low level node",
            "title": "Low Level Node"
        }
    )
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["level"] == 2


def test_create_pyramid_node_with_string_level_should_fail(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level en string (doit échouer)
    
    Vérifie que le bug BUG-PYRAMID-002 est corrigé : le backend rejette
    les strings pour le champ "level" et retourne 422.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": "intermediate",  # String (invalide)
            "content": "This should fail",
            "title": "String Level Node"
        }
    )
    
    # Doit retourner 422 (validation error)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}. BUG-PYRAMID-002 not fixed!"


def test_create_pyramid_node_with_invalid_level_should_fail(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level invalide (doit échouer)
    
    Vérifie que les valeurs de level en dehors de [0, 1, 2] sont rejetées.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 999,  # Invalide (hors range)
            "content": "Invalid level",
            "title": "Invalid Level Node"
        }
    )
    
    # Doit retourner 422 (validation error)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"


def test_create_pyramid_node_with_negative_level_should_fail(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal avec level négatif (doit échouer)
    
    Vérifie que les valeurs négatives sont rejetées.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": -1,  # Négatif (invalide)
            "content": "Negative level",
            "title": "Negative Level Node"
        }
    )
    
    # Doit retourner 422 (validation error)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"


def test_create_pyramid_node_with_missing_level_should_fail(client, test_user_token, test_project, db):
    """
    Test création de nœud pyramidal sans level (doit échouer)
    
    Vérifie que le champ "level" est obligatoire.
    """
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            # Manque le champ "level"
            "content": "Missing level",
            "title": "Missing Level Node"
        }
    )
    
    # Doit retourner 422 (validation error)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"


def test_frontend_level_conversion_mapping(client, test_user_token, test_project, db):
    """
    Test de la correspondance frontend→backend pour les niveaux
    
    Vérifie que la conversion frontend (high/intermediate/low) → backend (0/1/2)
    fonctionne correctement.
    
    Frontend mapping:
    - "high" → 0
    - "intermediate" → 1
    - "low" → 2
    """
    # Tester high → 0
    response_high = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 0,  # Frontend envoie 0 pour "high"
            "content": "High level content",
            "title": "High Level"
        }
    )
    assert response_high.status_code == 201
    assert response_high.json()["level"] == 0
    
    # Tester intermediate → 1
    response_intermediate = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 1,  # Frontend envoie 1 pour "intermediate"
            "content": "Intermediate level content",
            "title": "Intermediate Level"
        }
    )
    assert response_intermediate.status_code == 201
    assert response_intermediate.json()["level"] == 1
    
    # Tester low → 2
    response_low = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 2,  # Frontend envoie 2 pour "low"
            "content": "Low level content",
            "title": "Low Level"
        }
    )
    assert response_low.status_code == 201
    assert response_low.json()["level"] == 2
