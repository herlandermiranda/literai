"""
Tests d'intégration pour les endpoints /documents
"""
import pytest
from app.crud.crud_document import document as crud_document


def test_get_documents_by_project(client, test_user, test_user_token, test_project, test_document, db):
    """Test GET /api/v1/documents?project_id={id} - Liste des documents d'un projet"""
    response = client.get(
        f"/api/v1/documents/?project_id={test_project.id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"] == str(test_document.id)
    assert data[0]["title"] == test_document.title


def test_get_document_detail(client, test_user, test_user_token, test_document):
    """Test GET /api/v1/documents/{id} - Détail d'un document"""
    response = client.get(
        f"/api/v1/documents/{test_document.id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_document.id)
    assert data["title"] == test_document.title
    assert data["content_raw"] == test_document.content_raw


def test_create_document(client, test_user, test_user_token, test_project, db):
    """Test POST /api/v1/documents?project_id={id} - Création d'un document"""
    document_data = {
        "title": "Nouveau Document",
        "content_raw": "Contenu du document",
        "type": "draft"
    }
    
    response = client.post(
        f"/api/v1/documents/?project_id={test_project.id}",
        json=document_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == document_data["title"]
    assert data["content_raw"] == document_data["content_raw"]
    assert data["type"] == document_data["type"]
    assert "id" in data
    
    # Vérifier en DB
    doc = crud_document.get(db, id=data["id"])
    assert doc is not None
    assert doc.title == document_data["title"]
    assert doc.project_id == test_project.id


def test_update_document(client, test_user, test_user_token, test_document, db):
    """Test PUT /api/v1/documents/{id} - Mise à jour d'un document"""
    update_data = {
        "title": "Titre Modifié",
        "content_raw": "Contenu modifié",
        "type": "scene"
    }
    
    response = client.put(
        f"/api/v1/documents/{test_document.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["content_raw"] == update_data["content_raw"]
    
    # Vérifier en DB
    db.refresh(test_document)
    assert test_document.title == update_data["title"]
    assert test_document.content_raw == update_data["content_raw"]


def test_delete_document(client, test_user, test_user_token, test_project, db):
    """Test DELETE /api/v1/documents/{id} - Suppression d'un document"""
    # Créer un document à supprimer
    doc = crud_document.create(db, obj_in={
        "title": "Document à Supprimer",
        "content_raw": "Test",
        "type": "draft",
        "project_id": test_project.id
    })
    doc_id = doc.id
    
    response = client.delete(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 204
    
    # Vérifier que le document n'existe plus
    deleted_doc = crud_document.get(db, id=doc_id)
    assert deleted_doc is None


def test_create_document_with_parent(client, test_user, test_user_token, test_project, test_document, db):
    """Test POST /api/v1/documents avec parent_id - Création d'un sous-document"""
    document_data = {
        "title": "Sous-Document",
        "content_raw": "Contenu du sous-document",
        "type": "scene"
    }
    
    response = client.post(
        f"/api/v1/documents/?project_id={test_project.id}",
        json=document_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == document_data["title"]
    assert data["type"] == document_data["type"]
    
    # Vérifier en DB
    doc = crud_document.get(db, id=data["id"])
    assert doc is not None
    assert doc.title == document_data["title"]
