"""
Tests d'intégration pour les endpoints /projects
"""
import pytest
from app.models.user import User
from app.models.project import Project
from app.crud.crud_project import project as crud_project


def test_get_projects_list(client, test_user, test_user_token, db):
    """Test GET /api/v1/projects - Liste des projets de l'utilisateur"""
    # Créer quelques projets de test
    project1 = crud_project.create(db, obj_in={
        "title": "Projet Test 1",
        "description": "Description 1",
        "user_id": test_user.id
    })
    project2 = crud_project.create(db, obj_in={
        "title": "Projet Test 2",
        "description": "Description 2",
        "user_id": test_user.id
    })
    
    # Appeler l'endpoint
    response = client.get(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    
    # Vérifier que les projets créés sont dans la liste
    project_titles = [p["title"] for p in data]
    assert "Projet Test 1" in project_titles
    assert "Projet Test 2" in project_titles


def test_get_project_detail(client, test_user, test_user_token, test_project, db):
    """Test GET /api/v1/projects/{id} - Détail d'un projet"""
    response = client.get(
        f"/api/v1/projects/{test_project.id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_project.id)
    assert data["title"] == test_project.title
    assert data["description"] == test_project.description


def test_create_project(client, test_user, test_user_token, db):
    """Test POST /api/v1/projects - Création d'un projet"""
    project_data = {
        "title": "Nouveau Projet",
        "description": "Description du nouveau projet"
    }
    
    response = client.post(
        "/api/v1/projects/",
        json=project_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == project_data["title"]
    assert data["description"] == project_data["description"]
    assert "id" in data
    
    # Vérifier que le projet existe en DB
    project = crud_project.get(db, id=data["id"])
    assert project is not None
    assert project.title == project_data["title"]


def test_update_project(client, test_user, test_user_token, test_project, db):
    """Test PUT /api/v1/projects/{id} - Mise à jour d'un projet"""
    update_data = {
        "title": "Titre Modifié",
        "description": "Description modifiée"
    }
    
    response = client.put(
        f"/api/v1/projects/{test_project.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    
    # Vérifier en DB
    db.refresh(test_project)
    assert test_project.title == update_data["title"]


def test_delete_project(client, test_user, test_user_token, db):
    """Test DELETE /api/v1/projects/{id} - Suppression d'un projet"""
    # Créer un projet à supprimer
    project = crud_project.create(db, obj_in={
        "title": "Projet à Supprimer",
        "description": "Test",
        "user_id": test_user.id
    })
    project_id = project.id
    
    response = client.delete(
        f"/api/v1/projects/{project_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 204
    
    # Vérifier que le projet n'existe plus
    deleted_project = crud_project.get(db, id=project_id)
    assert deleted_project is None


def test_get_project_unauthorized(client, test_project):
    """Test GET /api/v1/projects/{id} sans authentification"""
    response = client.get(f"/api/v1/projects/{test_project.id}")
    assert response.status_code == 403  # FastAPI returns 403 for missing auth


def test_get_project_not_found(client, test_user, test_user_token):
    """Test GET /api/v1/projects/{id} avec un ID inexistant"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(
        f"/api/v1/projects/{fake_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 404
