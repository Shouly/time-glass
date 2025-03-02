"""Create app_categories and hourly_app_usage tables

Revision ID: initial_migration
Revises: 
Create Date: 2023-03-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'initial_migration'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建应用分类表
    op.create_table('app_categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('productivity_type', sa.Enum('productive', 'non_productive', 'neutral', name='productivitytype'), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index(op.f('ix_app_categories_id'), 'app_categories', ['id'], unique=False)
    op.create_index(op.f('ix_app_categories_name'), 'app_categories', ['name'], unique=False)

    # 创建小时应用使用统计表
    op.create_table('hourly_app_usage',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('hour_of_day', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('is_working_hour', sa.Boolean(), nullable=False),
        sa.Column('app_name', sa.String(length=100), nullable=False),
        sa.Column('window_name', sa.String(length=255), nullable=True),
        sa.Column('app_category_id', sa.Integer(), nullable=True),
        sa.Column('total_time_seconds', sa.Float(), nullable=False),
        sa.Column('active_time_seconds', sa.Float(), nullable=True),
        sa.Column('session_count', sa.Integer(), nullable=False),
        sa.Column('avg_session_time', sa.Float(), nullable=True),
        sa.Column('switch_count', sa.Integer(), nullable=True),
        sa.Column('concurrent_apps', sa.Float(), nullable=True),
        sa.Column('device_os', sa.String(length=50), nullable=True),
        sa.Column('device_os_version', sa.String(length=50), nullable=True),
        sa.Column('network_type', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['app_category_id'], ['app_categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'timestamp', 'app_name'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index(op.f('ix_hourly_app_usage_app_category_id'), 'hourly_app_usage', ['app_category_id'], unique=False)
    op.create_index(op.f('ix_hourly_app_usage_app_name'), 'hourly_app_usage', ['app_name'], unique=False)
    op.create_index(op.f('ix_hourly_app_usage_id'), 'hourly_app_usage', ['id'], unique=False)
    op.create_index(op.f('ix_hourly_app_usage_timestamp'), 'hourly_app_usage', ['timestamp'], unique=False)
    op.create_index(op.f('ix_hourly_app_usage_user_id'), 'hourly_app_usage', ['user_id'], unique=False)


def downgrade() -> None:
    # 删除表
    op.drop_table('hourly_app_usage')
    op.drop_table('app_categories') 