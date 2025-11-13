"""
Tests E2E pour le système de versioning.

Ces tests vérifient le fonctionnement complet du système de versioning :
- E2E-012 : Création de version automatique lors de la sauvegarde
- E2E-013 : Commit manuel avec message personnalisé
- E2E-014 : Visualisation du diff entre deux versions
- E2E-015 : Restauration d'une version antérieure
"""
import pytest
from uuid import UUID


def test_e2e_012_automatic_version_creation(client, test_user_token, test_project, db):
    """
    E2E-012 : Création de version automatique lors de la sauvegarde
    
    Scénario :
    1. Créer un nœud pyramidal
    2. Modifier le contenu du nœud
    3. Vérifier qu'une nouvelle version a été créée automatiquement
    """
    # 1. Créer un nœud pyramidal
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 0,
            "content": "Contenu initial du nœud",
            "title": "Nœud Test Versioning"
        }
    )
    assert response.status_code == 201
    node_id = response.json()["id"]
    
    # 2. Modifier le contenu du nœud
    response = client.put(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "content": "Contenu modifié du nœud - Version 2"
        }
    )
    assert response.status_code == 200
    
    # 3. Vérifier qu'une nouvelle version a été créée
    response = client.get(
        f"/api/v1/versions/pyramid/{node_id}/versions",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    versions = response.json()
    
    # Doit avoir au moins 2 versions (initiale + modification)
    assert len(versions) >= 2
    
    # La version la plus récente doit contenir le nouveau contenu
    latest_version = versions[0]  # Supposant que les versions sont triées par date décroissante
    assert "Version 2" in latest_version.get("content_snapshot", "")


def test_e2e_013_manual_commit_with_message(client, test_user_token, test_project, db):
    """
    E2E-013 : Commit manuel avec message personnalisé
    
    Scénario :
    1. Créer un nœud pyramidal
    2. Créer un commit manuel avec un message personnalisé
    3. Vérifier que le commit a été créé avec le bon message
    """
    # 1. Créer un nœud pyramidal
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 1,
            "content": "Contenu pour commit manuel",
            "title": "Nœud Commit Manuel"
        }
    )
    assert response.status_code == 201
    node_id = response.json()["id"]
    
    # 2. Créer un commit manuel
    # D'abord, récupérer le contenu actuel du nœud
    response = client.get(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    node = response.json()
    
    # Créer une version manuelle
    response = client.post(
        "/api/v1/versions/versions",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "pyramid_node_id": node_id,
            "commit_message": "Ajout de la description détaillée du personnage principal",
            "author_email": "test@example.com",
            "content_snapshot": node["content"]
        }
    )
    if response.status_code not in [200, 201]:
        print(f"Error: {response.status_code} - {response.text}")
    assert response.status_code in [200, 201]
    commit = response.json()
    
    # 3. Vérifier le commit
    assert commit["commit_message"] == "Ajout de la description détaillée du personnage principal"
    assert "id" in commit
    assert "created_at" in commit


def test_e2e_014_diff_between_versions(client, test_user_token, test_project, db):
    """
    E2E-014 : Visualisation du diff entre deux versions
    
    Scénario :
    1. Créer un nœud pyramidal
    2. Modifier le nœud plusieurs fois
    3. Récupérer le diff entre deux versions
    4. Vérifier que le diff contient les changements
    """
    # 1. Créer un nœud pyramidal
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 2,
            "content": "Version 1 : Contenu initial",
            "title": "Nœud Diff Test"
        }
    )
    assert response.status_code == 201
    node_id = response.json()["id"]
    
    # 2. Première modification
    response = client.put(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "content": "Version 2 : Contenu modifié avec ajout de texte"
        }
    )
    assert response.status_code == 200
    
    # 3. Deuxième modification
    response = client.put(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "content": "Version 3 : Contenu complètement réécrit"
        }
    )
    assert response.status_code == 200
    
    # 4. Récupérer toutes les versions
    response = client.get(
        f"/api/v1/versions/pyramid/{node_id}/versions",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    versions = response.json()
    
    # Doit avoir au moins 3 versions
    assert len(versions) >= 3
    
    # 5. Récupérer le diff entre version 1 et version 3
    version_1_id = versions[-1]["id"]  # Première version (plus ancienne)
    version_3_id = versions[0]["id"]   # Dernière version (plus récente)
    
    response = client.post(
        f"/api/v1/versions/versions/diff?version_a_id={version_1_id}&version_b_id={version_3_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
    assert response.status_code == 200
    diff = response.json()
    
    # Vérifier que le diff contient les changements
    assert "diff" in diff or "diff_text" in diff or "additions" in diff or "deletions" in diff or "changes" in diff


def test_e2e_015_restore_previous_version(client, test_user_token, test_project, db):
    """
    E2E-015 : Restauration d'une version antérieure
    
    Scénario :
    1. Créer un nœud pyramidal
    2. Modifier le nœud plusieurs fois
    3. Restaurer une version antérieure
    4. Vérifier que le contenu a été restauré
    """
    # 1. Créer un nœud pyramidal
    response = client.post(
        "/api/v1/pyramid/nodes/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "project_id": str(test_project.id),
            "level": 0,
            "content": "Version originale : Contenu à conserver",
            "title": "Nœud Restore Test"
        }
    )
    assert response.status_code == 201
    node_id = response.json()["id"]
    original_content = "Version originale : Contenu à conserver"
    
    # 2. Modifier le nœud (version 2)
    response = client.put(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "content": "Version 2 : Modification temporaire"
        }
    )
    assert response.status_code == 200
    
    # 3. Modifier à nouveau (version 3)
    response = client.put(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "content": "Version 3 : Erreur à corriger"
        }
    )
    assert response.status_code == 200
    
    # 4. Récupérer toutes les versions
    response = client.get(
        f"/api/v1/versions/pyramid/{node_id}/versions",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    versions = response.json()
    
    # Trouver la version originale
    original_version_id = versions[-1]["id"]  # Première version
    # 5. Restaurer la version originale
    response = client.post(
        "/api/v1/versions/versions/restore",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "version_id": original_version_id,
            "create_new_version": True
        }
    )
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
    assert response.status_code == 200
    
    # 6. Vérifier que le contenu a été restauré
    response = client.get(
        f"/api/v1/pyramid/nodes/{node_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    node = response.json()
    
    # Le contenu doit être celui de la version originale
    assert node["content"] == original_content
