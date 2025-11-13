"""update_llm_request_types

Revision ID: 30583d6b69ae
Revises: d6f533f0d9ca
Create Date: 2025-11-10 02:04:15.952125

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '30583d6b69ae'
down_revision = 'd6f533f0d9ca'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new enum values to llmrequesttype
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'continuation'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'rewriting'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'suggestion'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'analysis'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'character_development'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'worldbuilding'")
    op.execute("ALTER TYPE llmrequesttype ADD VALUE IF NOT EXISTS 'dialogue_enhancement'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type
    pass
