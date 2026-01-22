#!/usr/bin/env python3
"""
Synthetic Data Generator for Uru Database
Generates realistic test data for all 30 tables respecting foreign key constraints.

Usage:
    pip install faker
    python scripts/python/generate_synthetic_data.py --db-path ./data/uru.db --seed 42
"""

import argparse
import json
import random
import sqlite3
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from faker import Faker


class SyntheticDataGenerator:
    """Generates synthetic data for all Uru database tables."""

    def __init__(self, db_path: str, seed: int = 42):
        self.db_path = db_path
        self.seed = seed
        self.fake = Faker("pt_BR")
        Faker.seed(seed)
        random.seed(seed)

        # Store generated IDs for foreign key references
        self.shop_ids: list[str] = []
        self.brand_ids: list[str] = []
        self.category_ids: list[str] = []
        self.product_ids: list[str] = []
        self.location_ids: list[str] = []
        self.customer_ids: list[str] = []
        self.customer_group_ids: list[str] = []
        self.user_ids: list[str] = []
        self.role_ids: list[str] = []
        self.transaction_ids: list[str] = []
        self.order_ids: list[str] = []
        self.payment_ids: list[str] = []
        self.checkout_ids: list[str] = []
        self.inquiry_ids: list[str] = []
        self.inventory_level_ids: list[str] = []
        self.shipment_ids: list[str] = []

        # Configuration for data volume
        self.config = {
            "shops": 3,
            "brands": 30,
            "categories": 50,
            "products": 500,
            "locations": 10,
            "customers": 500,
            "customer_groups": 10,
            "users": 50,
            "roles": 5,
            "transactions": 1000,
            "orders": 800,
            "payments": 1200,
            "checkouts": 300,
            "inquiries": 100,
            "reviews": 400,
            "inventory_levels": 1500,
            "shipments": 600,
        }

    def _uuid(self) -> str:
        """Generate a UUID string."""
        return str(uuid.uuid4())

    def _timestamp(self, days_ago_max: int = 365) -> str:
        """Generate a random timestamp within the last N days."""
        days_ago = random.randint(0, days_ago_max)
        dt = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    def _future_timestamp(self, days_ahead_max: int = 30) -> str:
        """Generate a random future timestamp."""
        days_ahead = random.randint(1, days_ahead_max)
        dt = datetime.now() + timedelta(days=days_ahead)
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    def _date(self, days_ago_max: int = 365) -> str:
        """Generate a random date."""
        days_ago = random.randint(0, days_ago_max)
        dt = datetime.now() - timedelta(days=days_ago)
        return dt.strftime("%Y-%m-%d")

    def _future_date(self, days_ahead_max: int = 365) -> str:
        """Generate a random future date."""
        days_ahead = random.randint(1, days_ahead_max)
        dt = datetime.now() + timedelta(days=days_ahead)
        return dt.strftime("%Y-%m-%d")

    def _slug(self, name: str) -> str:
        """Generate a URL-friendly slug from name."""
        import re

        slug = name.lower()
        slug = re.sub(r"[àáâãäå]", "a", slug)
        slug = re.sub(r"[èéêë]", "e", slug)
        slug = re.sub(r"[ìíîï]", "i", slug)
        slug = re.sub(r"[òóôõö]", "o", slug)
        slug = re.sub(r"[ùúûü]", "u", slug)
        slug = re.sub(r"[ç]", "c", slug)
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        slug = slug.strip("-")
        return slug

    def _json(self, data: Any) -> str:
        """Convert data to JSON string."""
        return json.dumps(data, ensure_ascii=False)

    def _random_choice_or_none(self, items: list, none_probability: float = 0.2) -> Any:
        """Return a random item or None."""
        if not items or random.random() < none_probability:
            return None
        return random.choice(items)

    def _get_schema_path(self) -> Path:
        desktop_dir = Path(__file__).resolve().parents[2]
        return desktop_dir / "src-tauri" / "migrations" / "001_initial_schema.sql"

    def _ensure_schema(self, cursor: sqlite3.Cursor):
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='shops'",
        )
        if cursor.fetchone():
            return

        schema_path = self._get_schema_path()
        message = (
            "Database schema not found. Run migrations before generating data. "
            f"Expected schema file at: {schema_path}"
        )
        raise RuntimeError(message)

    def connect(self) -> sqlite3.Connection:
        """Create database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def run(self):
        """Execute the full data generation process."""
        print(f"Starting synthetic data generation for {self.db_path}")
        print(f"Using seed: {self.seed}")

        conn = self.connect()
        cursor = conn.cursor()

        try:
            self._ensure_schema(cursor)

            # Level 0: Base tables (no dependencies)
            print("\n[Level 0] Generating base tables...")
            self.generate_shops(cursor)
            self.generate_users(cursor)
            self.generate_roles(cursor)
            self.generate_locations(cursor)
            self.generate_modules(cursor)
            self.generate_shop_templates(cursor)

            # Level 1: First level dependencies
            print("\n[Level 1] Generating first level dependencies...")
            self.generate_brands(cursor)
            self.generate_categories(cursor)
            self.generate_customer_groups(cursor)
            self.generate_customers(cursor)

            # Level 2: Second level dependencies
            print("\n[Level 2] Generating second level dependencies...")
            self.generate_products(cursor)
            self.generate_customer_addresses(cursor)
            self.generate_customer_group_memberships(cursor)
            self.generate_user_roles(cursor)
            self.generate_user_identities(cursor)
            self.generate_user_sessions(cursor)
            self.generate_checkouts(cursor)

            # Level 3: Third level dependencies
            print("\n[Level 3] Generating third level dependencies...")
            self.generate_product_categories(cursor)
            self.generate_inventory_levels(cursor)
            self.generate_transactions(cursor)
            self.generate_orders(cursor)
            self.generate_inquiries(cursor)

            # Level 4: Fourth level dependencies
            print("\n[Level 4] Generating fourth level dependencies...")
            self.generate_transaction_items(cursor)
            self.generate_payments(cursor)
            self.generate_shipments(cursor)
            self.generate_inquiry_messages(cursor)
            self.generate_reviews(cursor)

            # Level 5: Fifth level dependencies
            print("\n[Level 5] Generating fifth level dependencies...")
            self.generate_inventory_movements(cursor)
            self.generate_refunds(cursor)
            self.generate_shipment_items(cursor)
            self.generate_shipment_events(cursor)

            conn.commit()
            print("\n✓ Data generation completed successfully!")
            self._print_summary(cursor)

        except Exception as e:
            conn.rollback()
            print(f"\n✗ Error during generation: {e}")
            raise
        finally:
            conn.close()

    def _print_summary(self, cursor: sqlite3.Cursor):
        """Print a summary of generated data."""
        tables = [
            "shops",
            "brands",
            "categories",
            "products",
            "product_categories",
            "locations",
            "inventory_levels",
            "customers",
            "customer_groups",
            "customer_group_memberships",
            "customer_addresses",
            "users",
            "user_identities",
            "user_sessions",
            "roles",
            "user_roles",
            "transactions",
            "transaction_items",
            "inventory_movements",
            "payments",
            "refunds",
            "checkouts",
            "orders",
            "shipments",
            "shipment_items",
            "shipment_events",
            "inquiries",
            "inquiry_messages",
            "reviews",
            "product_metrics",
            "modules",
            "shop_templates",
        ]

        print("\n" + "=" * 50)
        print("DATA GENERATION SUMMARY")
        print("=" * 50)

        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count} records")

    # ==========================================================================
    # LEVEL 0: BASE TABLES
    # ==========================================================================

    def generate_shops(self, cursor: sqlite3.Cursor):
        """Generate shop records."""
        shops_data = [
            ("Loja Principal", "loja-principal"),
            ("Filial Centro", "filial-centro"),
            ("Filial Shopping", "filial-shopping"),
        ]

        for name, slug in shops_data:
            shop_id = self._uuid()
            self.shop_ids.append(shop_id)

            cursor.execute(
                """
                INSERT INTO shops (id, name, legal_name, slug, status,
                    features_config, mail_config, storage_config, settings, branding,
                    currency, timezone, locale, owner_id, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    shop_id,
                    name,
                    f"{name} LTDA",
                    slug,
                    "active",
                    self._json({"inventory": True, "orders": True, "customers": True}),
                    self._json({"smtp_host": "smtp.example.com", "smtp_port": 587}),
                    self._json({"provider": "local", "path": "/storage"}),
                    self._json({"theme": "light", "language": "pt-BR"}),
                    self._json({"primary_color": "#3B82F6", "logo_url": None}),
                    "BRL",
                    "America/Sao_Paulo",
                    "pt-BR",
                    None,
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {len(shops_data)} shops")

    def generate_users(self, cursor: sqlite3.Cursor):
        """Generate user records."""
        count = self.config["users"]

        for i in range(count):
            user_id = self._uuid()
            self.user_ids.append(user_id)

            email = self.fake.unique.email()
            phone = self.fake.phone_number()

            cursor.execute(
                """
                INSERT INTO users (id, email, phone, password_hash, security_stamp,
                    is_email_verified, is_phone_verified, failed_login_attempts,
                    lockout_end_at, mfa_enabled, mfa_secret, mfa_backup_codes,
                    last_login_at, last_login_ip, _status, created_at, updated_at,
                    profile_type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    user_id,
                    email,
                    phone,
                    "$argon2id$v=19$m=65536,t=3,p=4$" + self.fake.sha256()[:22],
                    self._uuid(),
                    random.choice([0, 1]),
                    random.choice([0, 1]),
                    random.randint(0, 3),
                    None,
                    0,
                    None,
                    None,
                    self._timestamp(30) if random.random() > 0.3 else None,
                    self.fake.ipv4() if random.random() > 0.3 else None,
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                    random.choice(["admin", "staff", "manager"]),
                    random.choice(["active", "active", "active", "inactive"]),
                ),
            )

        print(f"  ✓ Generated {count} users")

    def generate_roles(self, cursor: sqlite3.Cursor):
        """Generate role records."""
        roles_data = [
            ("admin", ["all"]),
            ("manager", ["read", "write", "delete", "manage_staff"]),
            ("staff", ["read", "write"]),
            ("viewer", ["read"]),
            ("cashier", ["read", "write", "process_payments"]),
        ]

        for name, permissions in roles_data:
            role_id = self._uuid()
            self.role_ids.append(role_id)

            cursor.execute(
                """
                INSERT INTO roles (id, name, permissions, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    role_id,
                    name,
                    self._json(permissions),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {len(roles_data)} roles")

    def generate_locations(self, cursor: sqlite3.Cursor):
        """Generate location records."""
        count = self.config["locations"]
        location_types = ["warehouse", "store", "transit", "virtual"]

        locations_data = [
            ("Depósito Central", "warehouse"),
            ("Loja Matriz", "store"),
            ("Loja Centro", "store"),
            ("Loja Shopping Norte", "store"),
            ("Loja Shopping Sul", "store"),
            ("Em Trânsito", "transit"),
            ("Depósito Secundário", "warehouse"),
            ("Ponto de Coleta 1", "store"),
            ("Ponto de Coleta 2", "store"),
            ("Estoque Virtual", "virtual"),
        ]

        for name, loc_type in locations_data[:count]:
            location_id = self._uuid()
            self.location_ids.append(location_id)

            address_data = {
                "street": self.fake.street_address(),
                "city": self.fake.city(),
                "state": self.fake.state_abbr(),
                "postal_code": self.fake.postcode(),
                "country": "BR",
            }

            cursor.execute(
                """
                INSERT INTO locations (id, name, type, is_sellable, address_data,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    location_id,
                    name,
                    loc_type,
                    1 if loc_type in ["warehouse", "store"] else 0,
                    self._json(address_data),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} locations")

    def generate_modules(self, cursor: sqlite3.Cursor):
        """Generate module records."""
        # Módulos Core (sempre habilitados)
        core_modules = [
            ("mod-products", "products", "Produtos", "Catálogo de produtos e serviços", "core", 1, '["products", "brands", "categories", "product_categories"]'),
            ("mod-customers", "customers", "Clientes", "Gerenciamento de clientes", "core", 1, '["customers", "customer_addresses", "customer_groups", "customer_group_memberships"]'),
            ("mod-transactions", "transactions", "Transações", "Registro de transações financeiras", "core", 1, '["transactions", "transaction_items"]'),
            ("mod-orders", "orders", "Pedidos", "Gerenciamento de pedidos", "core", 1, '["orders"]'),
            ("mod-payments", "payments", "Pagamentos", "Processamento de pagamentos", "core", 1, '["payments", "refunds"]'),
        ]

        # Módulos Opcionais - Logística
        logistics_modules = [
            ("mod-shipping", "shipping", "Entrega", "Gerenciamento de entregas e frete", "logistics", '["orders"]', '["shipments", "shipment_items", "shipment_events"]'),
            ("mod-inventory", "inventory", "Estoque", "Controle de estoque e inventário", "logistics", '["products"]', '["inventory_levels", "inventory_movements"]'),
            ("mod-locations", "locations", "Locais", "Gerenciamento de locais e depósitos", "logistics", "[]", '["locations"]'),
        ]

        # Módulos Opcionais - Vendas
        sales_modules = [
            ("mod-checkout", "checkout", "Checkout", "Carrinho de compras e checkout", "sales", '["products", "customers"]', '["checkouts"]'),
            ("mod-pos", "pos", "Ponto de Venda", "Sistema de ponto de venda (PDV)", "sales", '["transactions", "inventory"]', "[]"),
        ]

        # Módulos Opcionais - Marketing e Suporte
        marketing_modules = [
            ("mod-reviews", "reviews", "Avaliações", "Sistema de avaliações e reviews", "marketing", '["orders", "products", "customers"]', '["reviews"]'),
            ("mod-inquiries", "inquiries", "Atendimento", "Sistema de atendimento ao cliente (SAC)", "marketing", '["customers"]', '["inquiries"]'),
        ]



        count = 0

        # Insert core modules
        for module_id, code, name, description, category, is_core, tables_used in core_modules:
            cursor.execute(
                """
                INSERT OR IGNORE INTO modules (id, code, name, description, category, is_core, tables_used,
                    required_modules, conflicts_with, version, metadata, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    module_id,
                    code,
                    name,
                    description,
                    category,
                    is_core,
                    tables_used,
                    "[]",
                    "[]",
                    "1.0.0",
                    "{}",
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            count += 1

        # Insert logistics modules
        for module_id, code, name, description, category, required_modules, tables_used in logistics_modules:
            cursor.execute(
                """
                INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used,
                    conflicts_with, is_core, version, metadata, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    module_id,
                    code,
                    name,
                    description,
                    category,
                    required_modules,
                    tables_used,
                    "[]",
                    0,
                    "1.0.0",
                    "{}",
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            count += 1

        # Insert sales modules
        for module_id, code, name, description, category, required_modules, tables_used in sales_modules:
            cursor.execute(
                """
                INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used,
                    conflicts_with, is_core, version, metadata, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    module_id,
                    code,
                    name,
                    description,
                    category,
                    required_modules,
                    tables_used,
                    "[]",
                    0,
                    "1.0.0",
                    "{}",
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            count += 1

        # Insert marketing modules
        for module_id, code, name, description, category, required_modules, tables_used in marketing_modules:
            cursor.execute(
                """
                INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used,
                    conflicts_with, is_core, version, metadata, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    module_id,
                    code,
                    name,
                    description,
                    category,
                    required_modules,
                    tables_used,
                    "[]",
                    0,
                    "1.0.0",
                    "{}",
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            count += 1

        print(f"  ✓ Generated {count} modules")

    def generate_shop_templates(self, cursor: sqlite3.Cursor):
        """Generate shop template records."""
        templates = [
            (
                "tpl-online-store",
                "online_store",
                "Loja Virtual",
                "Loja online com checkout, estoque e entregas",
                "ecommerce",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "inquiries": true, "reviews": true, "pos": false, "locations": false}',
                '{"allow_guest_checkout": true, "require_shipping": true}',
                '["shipping", "checkout", "inventory", "reviews", "inquiries"]',
            ),
            (
                "tpl-physical-store",
                "physical_store",
                "Loja Física",
                "Loja física com PDV e controle de estoque",
                "retail",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "pos": true, "inventory": true, "locations": true, "inquiries": true, "shipping": false, "checkout": false, "reviews": false}',
                '{"require_shipping": false, "allow_offline_sales": true}',
                '["pos", "inventory", "locations"]',
            ),
            (
                "tpl-marketplace",
                "marketplace",
                "Marketplace",
                "Marketplace multi-vendedor completo",
                "ecommerce",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "locations": true, "inquiries": true, "reviews": true, "pos": false}',
                '{"multi_vendor": true, "allow_guest_checkout": true, "require_shipping": true}',
                '["shipping", "checkout", "inventory", "locations", "reviews", "inquiries"]',
            ),
            (
                "tpl-hybrid-store",
                "hybrid_store",
                "Loja Híbrida",
                "Loja física e virtual com todos os recursos",
                "retail",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "pos": true, "locations": true, "inquiries": true, "reviews": true}',
                '{"allow_guest_checkout": true, "require_shipping": true, "allow_offline_sales": true}',
                '["shipping", "checkout", "inventory", "pos", "locations", "reviews", "inquiries"]',
            ),
            (
                "tpl-consulting",
                "consulting",
                "Consultoria",
                "Serviços e consultoria sem necessidade de estoque ou entrega",
                "services",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "inquiries": true, "shipping": false, "inventory": false, "checkout": false, "pos": false, "reviews": false, "locations": false}',
                '{"product_type_default": "service", "require_shipping": false}',
                '["inquiries"]',
            ),
            (
                "tpl-online-education",
                "online_education",
                "Aula Virtual",
                "Plataforma de educação e cursos online",
                "education",
                '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "checkout": true, "inquiries": true, "reviews": true, "shipping": false, "inventory": false, "pos": false, "locations": false}',
                '{"product_type_default": "digital", "require_shipping": false, "allow_guest_checkout": false}',
                '["checkout", "reviews", "inquiries"]',
            ),
        ]

        count = 0

        for template_id, code, name, description, category, features_config, default_settings, recommended_modules in templates:
            cursor.execute(
                """
                INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config,
                    default_settings, recommended_modules, metadata, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    template_id,
                    code,
                    name,
                    description,
                    category,
                    features_config,
                    default_settings,
                    recommended_modules,
                    "{}",
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            count += 1

        print(f"  ✓ Generated {count} shop templates")

    # ==========================================================================
    # LEVEL 1: FIRST LEVEL DEPENDENCIES
    # ==========================================================================

    def generate_brands(self, cursor: sqlite3.Cursor):
        """Generate brand records."""
        count = self.config["brands"]

        brand_names = [
            "TechPro",
            "EcoVida",
            "StyleMax",
            "PowerTools",
            "NaturaCare",
            "UrbanWear",
            "HomePlus",
            "FitLife",
            "SmartGear",
            "PureEssence",
            "ModernLiving",
            "ActiveSport",
            "GreenChoice",
            "LuxuryLine",
            "BasicBest",
            "PremiumSelect",
            "ValueMart",
            "TrendyStyle",
            "ClassicTouch",
            "InnovateTech",
            "QualityFirst",
            "BudgetSmart",
            "EliteCollection",
            "SimpleLife",
            "ProSeries",
            "EverydayEssentials",
            "TopChoice",
            "BestValue",
            "PrimeSelection",
            "UltraQuality",
        ]

        for i, name in enumerate(brand_names[:count]):
            brand_id = self._uuid()
            self.brand_ids.append(brand_id)

            shop_id = random.choice(self.shop_ids)
            slug = self._slug(name) + f"-{i}"

            cursor.execute(
                """
                INSERT INTO brands (id, shop_id, name, slug, logo_url, banner_url,
                    description, rich_description, website_url, status, is_featured,
                    sort_order, seo_title, seo_keywords, metadata, _status,
                    created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    brand_id,
                    shop_id,
                    name,
                    slug,
                    f"https://cdn.example.com/brands/{slug}/logo.png" if random.random() > 0.3 else None,
                    f"https://cdn.example.com/brands/{slug}/banner.jpg" if random.random() > 0.5 else None,
                    self.fake.paragraph(nb_sentences=2),
                    f"<p>{self.fake.paragraph(nb_sentences=4)}</p>",
                    f"https://www.{slug}.com.br" if random.random() > 0.4 else None,
                    random.choice(["active", "active", "active", "inactive"]),
                    1 if random.random() > 0.8 else 0,
                    i,
                    f"{name} - Produtos de Qualidade",
                    self._json([name.lower(), "qualidade", "confiança"]),
                    self._json({"origin_country": "BR", "founded_year": random.randint(1990, 2020)}),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} brands")

    def generate_categories(self, cursor: sqlite3.Cursor):
        """Generate category records with hierarchy."""
        count = self.config["categories"]

        # Main categories (no parent)
        main_categories = [
            "Eletrônicos",
            "Vestuário",
            "Casa e Decoração",
            "Esportes",
            "Beleza e Saúde",
            "Alimentos",
            "Livros",
            "Brinquedos",
            "Ferramentas",
            "Automotivo",
        ]

        # Subcategories mapping
        subcategories = {
            "Eletrônicos": ["Smartphones", "Notebooks", "TVs", "Acessórios", "Áudio"],
            "Vestuário": ["Masculino", "Feminino", "Infantil", "Calçados", "Acessórios"],
            "Casa e Decoração": ["Móveis", "Iluminação", "Cozinha", "Banheiro", "Jardim"],
            "Esportes": ["Fitness", "Futebol", "Natação", "Ciclismo", "Camping"],
            "Beleza e Saúde": ["Skincare", "Maquiagem", "Cabelos", "Perfumes", "Suplementos"],
            "Alimentos": ["Orgânicos", "Bebidas", "Snacks", "Congelados", "Importados"],
            "Livros": ["Ficção", "Técnicos", "Infantis", "Autoajuda", "Acadêmicos"],
            "Brinquedos": ["Educativos", "Jogos", "Bonecas", "Carrinhos", "Eletrônicos"],
            "Ferramentas": ["Manuais", "Elétricas", "Jardinagem", "Medição", "Segurança"],
            "Automotivo": ["Peças", "Acessórios", "Limpeza", "Áudio", "Iluminação"],
        }

        generated = 0
        parent_ids = {}

        # Generate main categories
        for i, name in enumerate(main_categories):
            if generated >= count:
                break

            cat_id = self._uuid()
            self.category_ids.append(cat_id)
            parent_ids[name] = cat_id

            shop_id = random.choice(self.shop_ids)
            slug = self._slug(name) + f"-{i}"

            cursor.execute(
                """
                INSERT INTO categories (id, shop_id, parent_id, name, slug, description,
                    image_url, banner_url, type, rules, is_visible, sort_order,
                    seo_title, seo_description, template_suffix, metadata, _status,
                    created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    cat_id,
                    shop_id,
                    None,
                    name,
                    slug,
                    self.fake.paragraph(nb_sentences=2),
                    f"https://cdn.example.com/categories/{slug}.jpg",
                    f"https://cdn.example.com/categories/{slug}-banner.jpg" if random.random() > 0.5 else None,
                    "manual",
                    self._json([]),
                    1,
                    i,
                    f"{name} - Melhores Ofertas",
                    f"Encontre os melhores produtos de {name}",
                    None,
                    self._json({"icon": "folder"}),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            generated += 1

        # Generate subcategories
        for main_cat, subs in subcategories.items():
            if main_cat not in parent_ids:
                continue

            parent_id = parent_ids[main_cat]

            for j, sub_name in enumerate(subs):
                if generated >= count:
                    break

                cat_id = self._uuid()
                self.category_ids.append(cat_id)

                shop_id = random.choice(self.shop_ids)
                slug = self._slug(f"{main_cat}-{sub_name}") + f"-{generated}"

                cursor.execute(
                    """
                    INSERT INTO categories (id, shop_id, parent_id, name, slug, description,
                        image_url, banner_url, type, rules, is_visible, sort_order,
                        seo_title, seo_description, template_suffix, metadata, _status,
                        created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        cat_id,
                        shop_id,
                        parent_id,
                        sub_name,
                        slug,
                        self.fake.paragraph(nb_sentences=1),
                        f"https://cdn.example.com/categories/{slug}.jpg" if random.random() > 0.3 else None,
                        None,
                        "manual",
                        self._json([]),
                        1,
                        j,
                        f"{sub_name} em {main_cat}",
                        f"Produtos de {sub_name}",
                        None,
                        self._json({"parent_name": main_cat}),
                        "created",
                        self._timestamp(300),
                        self._timestamp(30),
                    ),
                )
                generated += 1

        print(f"  ✓ Generated {generated} categories")

    def generate_customer_groups(self, cursor: sqlite3.Cursor):
        """Generate customer group records."""
        count = self.config["customer_groups"]

        groups_data = [
            ("VIP", "vip", "Clientes VIP com benefícios exclusivos", 15.0),
            ("Premium", "premium", "Clientes premium com descontos especiais", 10.0),
            ("Regular", "regular", "Clientes regulares", 0.0),
            ("Atacado", "wholesale", "Clientes de atacado", 20.0),
            ("Funcionários", "employees", "Funcionários da empresa", 25.0),
            ("Parceiros", "partners", "Parceiros comerciais", 12.0),
            ("Estudantes", "students", "Estudantes com desconto", 8.0),
            ("Idosos", "seniors", "Clientes acima de 60 anos", 5.0),
            ("Novos", "new", "Novos clientes", 5.0),
            ("Corporativo", "corporate", "Clientes corporativos", 18.0),
        ]

        for name, code, description, discount in groups_data[:count]:
            group_id = self._uuid()
            self.customer_group_ids.append(group_id)

            shop_id = random.choice(self.shop_ids)

            cursor.execute(
                """
                INSERT INTO customer_groups (id, shop_id, name, code, description, type,
                    rules, default_discount_percentage, price_list_id, tax_class,
                    allowed_payment_methods, min_order_amount, metadata, _status,
                    created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    group_id,
                    shop_id,
                    name,
                    code,
                    description,
                    "manual",
                    self._json([]),
                    discount,
                    None,
                    None,
                    self._json(["credit_card", "pix", "boleto"]),
                    0.0 if code != "wholesale" else 500.0,
                    self._json({"tier": code}),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} customer groups")

    def generate_customers(self, cursor: sqlite3.Cursor):
        """Generate customer records."""
        count = self.config["customers"]

        for _ in range(count):
            customer_id = self._uuid()
            self.customer_ids.append(customer_id)

            customer_type = random.choice(["individual", "individual", "individual", "company"])
            is_company = customer_type == "company"

            cursor.execute(
                """
                INSERT INTO customers (id, type, email, phone, first_name, last_name,
                    company_name, tax_id, tax_id_type, state_tax_id, status, currency,
                    language, tags, accepts_marketing, customer_group_id, total_spent,
                    orders_count, last_order_at, notes, metadata, custom_attributes,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    customer_id,
                    customer_type,
                    self.fake.unique.email(),
                    self.fake.phone_number(),
                    self.fake.first_name() if not is_company else None,
                    self.fake.last_name() if not is_company else None,
                    self.fake.company() if is_company else None,
                    self.fake.cpf() if not is_company else self.fake.cnpj(),
                    "cpf" if not is_company else "cnpj",
                    self.fake.random_number(digits=9) if is_company and random.random() > 0.5 else None,
                    random.choice(["active", "active", "active", "inactive"]),
                    "BRL",
                    "pt",
                    self._json(random.sample(["vip", "frequent", "new", "wholesale", "online"], k=random.randint(0, 2))),
                    random.choice([0, 1]),
                    self._random_choice_or_none(self.customer_group_ids, 0.6),
                    round(random.uniform(0, 50000), 2),
                    random.randint(0, 100),
                    self._timestamp(60) if random.random() > 0.3 else None,
                    self.fake.paragraph(nb_sentences=1) if random.random() > 0.7 else None,
                    self._json({"source": random.choice(["web", "store", "referral", "ads"])}),
                    self._json({}),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} customers")

    # ==========================================================================
    # LEVEL 2: SECOND LEVEL DEPENDENCIES
    # ==========================================================================

    def generate_products(self, cursor: sqlite3.Cursor):
        """Generate product records."""
        count = self.config["products"]

        product_types = ["physical", "physical", "physical", "digital", "service", "bundle"]
        statuses = ["active", "active", "active", "draft", "archived"]

        adjectives = ["Premium", "Básico", "Pro", "Ultra", "Mini", "Max", "Plus", "Lite", "Smart", "Classic"]
        nouns = [
            "Smartphone",
            "Notebook",
            "Câmera",
            "Fone",
            "Relógio",
            "Tablet",
            "Monitor",
            "Teclado",
            "Mouse",
            "Caixa de Som",
            "Carregador",
            "Cabo USB",
            "Capa",
            "Película",
            "Suporte",
            "Hub",
            "Adaptador",
            "Bateria",
            "Memória",
            "SSD",
            "Camiseta",
            "Calça",
            "Tênis",
            "Mochila",
            "Bolsa",
            "Carteira",
            "Óculos",
            "Chapéu",
            "Luva",
            "Cachecol",
        ]

        for i in range(count):
            product_id = self._uuid()
            self.product_ids.append(product_id)

            name = f"{random.choice(adjectives)} {random.choice(nouns)} {random.randint(100, 999)}"
            sku = f"SKU-{i:06d}"
            slug = self._slug(name) + f"-{i}"
            product_type = random.choice(product_types)
            price = round(random.uniform(10, 5000), 2)

            cursor.execute(
                """
                INSERT INTO products (id, sku, type, status, name, slug, gtin_ean, price,
                    promotional_price, cost_price, currency, tax_ncm, is_shippable,
                    weight_g, width_mm, height_mm, depth_mm, attributes, metadata,
                    category_id, brand_id, parent_id, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    product_id,
                    sku,
                    product_type,
                    random.choice(statuses),
                    name,
                    slug,
                    str(random.randint(1000000000000, 9999999999999)) if random.random() > 0.5 else None,
                    price,
                    round(price * random.uniform(0.7, 0.95), 2) if random.random() > 0.7 else None,
                    round(price * random.uniform(0.3, 0.6), 2) if random.random() > 0.4 else None,
                    "BRL",
                    f"{random.randint(1, 99):02d}.{random.randint(1, 99):02d}.{random.randint(1, 99):02d}"
                    if random.random() > 0.5
                    else None,
                    1 if product_type == "physical" else 0,
                    random.randint(100, 50000) if product_type == "physical" else 0,
                    random.randint(50, 1000) if product_type == "physical" else 0,
                    random.randint(50, 500) if product_type == "physical" else 0,
                    random.randint(50, 500) if product_type == "physical" else 0,
                    self._json(
                        {"color": random.choice(["Preto", "Branco", "Azul", "Vermelho", "Verde"]), "size": random.choice(["P", "M", "G", "GG", "U"])}
                    ),
                    self._json({"warranty_months": random.choice([3, 6, 12, 24])}),
                    self._random_choice_or_none(self.category_ids, 0.1),
                    self._random_choice_or_none(self.brand_ids, 0.2),
                    None,  # parent_id for variants
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} products")

    def generate_customer_addresses(self, cursor: sqlite3.Cursor):
        """Generate customer address records."""
        # Average 2 addresses per customer
        for customer_id in self.customer_ids:
            num_addresses = random.randint(1, 3)

            for i in range(num_addresses):
                address_id = self._uuid()

                cursor.execute(
                    """
                    INSERT INTO customer_addresses (id, customer_id, type, is_default,
                        first_name, last_name, company, address1, address2, city,
                        province_code, country_code, postal_code, phone, metadata,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        address_id,
                        customer_id,
                        random.choice(["shipping", "billing"]) if i > 0 else "shipping",
                        1 if i == 0 else 0,
                        self.fake.first_name(),
                        self.fake.last_name(),
                        self.fake.company() if random.random() > 0.8 else None,
                        self.fake.street_address(),
                        f"Apto {random.randint(1, 500)}" if random.random() > 0.5 else None,
                        self.fake.city(),
                        self.fake.state_abbr(),
                        "BR",
                        self.fake.postcode(),
                        self.fake.phone_number() if random.random() > 0.3 else None,
                        self._json({}),
                        "created",
                        self._timestamp(300),
                        self._timestamp(30),
                    ),
                )

        total = cursor.execute("SELECT COUNT(*) FROM customer_addresses").fetchone()[0]
        print(f"  ✓ Generated {total} customer addresses")

    def generate_customer_group_memberships(self, cursor: sqlite3.Cursor):
        """Generate customer group membership records."""
        count = 0

        # Assign ~30% of customers to groups
        for customer_id in random.sample(self.customer_ids, k=int(len(self.customer_ids) * 0.3)):
            num_groups = random.randint(1, 2)
            groups = random.sample(self.customer_group_ids, k=min(num_groups, len(self.customer_group_ids)))

            for group_id in groups:
                try:
                    cursor.execute(
                        """
                        INSERT INTO customer_group_memberships (customer_id, customer_group_id,
                            _status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?)
                    """,
                        (
                            customer_id,
                            group_id,
                            "created",
                            self._timestamp(300),
                            self._timestamp(30),
                        ),
                    )
                    count += 1
                except sqlite3.IntegrityError:
                    pass  # Skip duplicates

        print(f"  ✓ Generated {count} customer group memberships")

    def generate_user_roles(self, cursor: sqlite3.Cursor):
        """Generate user role assignments."""
        count = 0

        for user_id in self.user_ids:
            # Each user gets 1-2 roles
            num_roles = random.randint(1, 2)
            roles = random.sample(self.role_ids, k=min(num_roles, len(self.role_ids)))

            for role_id in roles:
                try:
                    cursor.execute(
                        """
                        INSERT INTO user_roles (user_id, role_id, _status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?)
                    """,
                        (
                            user_id,
                            role_id,
                            "created",
                            self._timestamp(300),
                            self._timestamp(30),
                        ),
                    )
                    count += 1
                except sqlite3.IntegrityError:
                    pass

        print(f"  ✓ Generated {count} user roles")

    def generate_user_identities(self, cursor: sqlite3.Cursor):
        """Generate user identity records (OAuth providers)."""
        count = 0
        providers = ["google", "facebook", "apple", "github"]

        # ~20% of users have OAuth identities
        for user_id in random.sample(self.user_ids, k=int(len(self.user_ids) * 0.2)):
            provider = random.choice(providers)

            cursor.execute(
                """
                INSERT INTO user_identities (id, user_id, provider, provider_user_id,
                    access_token, refresh_token, expires_at, profile_data, _status,
                    created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    self._uuid(),
                    user_id,
                    provider,
                    self.fake.uuid4(),
                    self.fake.sha256(),
                    self.fake.sha256() if random.random() > 0.5 else None,
                    self._future_timestamp(30) if random.random() > 0.3 else None,
                    self._json({"name": self.fake.name(), "email": self.fake.email()}),
                    "created",
                    self._timestamp(300),
                    self._timestamp(30),
                ),
            )
            count += 1

        print(f"  ✓ Generated {count} user identities")

    def generate_user_sessions(self, cursor: sqlite3.Cursor):
        """Generate user session records."""
        count = 0

        # Each user has 0-5 sessions
        for user_id in self.user_ids:
            num_sessions = random.randint(0, 5)

            for _ in range(num_sessions):
                cursor.execute(
                    """
                    INSERT INTO user_sessions (id, user_id, user_agent, ip_address,
                        device_type, location, token_hash, expires_at, revoked_at,
                        _status, created_at, updated_at, last_active_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        user_id,
                        self.fake.user_agent(),
                        self.fake.ipv4(),
                        random.choice(["desktop", "mobile", "tablet"]),
                        f"{self.fake.city()}, {self.fake.state_abbr()}",
                        self.fake.sha256(),
                        self._future_timestamp(7),
                        self._timestamp(7) if random.random() > 0.7 else None,
                        "created",
                        self._timestamp(30),
                        self._timestamp(7),
                        self._timestamp(1) if random.random() > 0.3 else None,
                    ),
                )
                count += 1

        print(f"  ✓ Generated {count} user sessions")

    def generate_checkouts(self, cursor: sqlite3.Cursor):
        """Generate checkout records."""
        count = self.config["checkouts"]
        statuses = ["open", "open", "completed", "abandoned", "expired"]

        for _ in range(count):
            checkout_id = self._uuid()
            self.checkout_ids.append(checkout_id)

            # Generate random items
            num_items = random.randint(1, 5)
            items = []
            subtotal = 0

            for _ in range(num_items):
                product_id = random.choice(self.product_ids)
                quantity = random.randint(1, 3)
                price = round(random.uniform(10, 500), 2)
                subtotal += price * quantity

                items.append(
                    {
                        "product_id": product_id,
                        "quantity": quantity,
                        "unit_price": price,
                        "total": round(price * quantity, 2),
                    }
                )

            total_tax = round(subtotal * 0.1, 2)
            total_shipping = round(random.uniform(0, 50), 2)
            total_discounts = round(subtotal * random.uniform(0, 0.15), 2)
            total_price = round(subtotal + total_tax + total_shipping - total_discounts, 2)

            status = random.choice(statuses)

            shop_id = random.choice(self.shop_ids)

            cursor.execute(
                """
                INSERT INTO checkouts (id, shop_id, token, user_id, email, items, shipping_address,
                    billing_address, shipping_line, applied_discount_codes, currency,
                    subtotal_price, total_tax, total_shipping, total_discounts, total_price,
                    status, reservation_expires_at, completed_at, metadata, recovery_url,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    checkout_id,
                    shop_id,
                    self._uuid(),
                    self._random_choice_or_none(self.user_ids, 0.4),
                    self.fake.email(),
                    self._json(items),
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                            "country": "BR",
                        }
                    ),
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                            "country": "BR",
                        }
                    )
                    if random.random() > 0.5
                    else None,
                    self._json({"method": random.choice(["standard", "express", "pickup"]), "price": total_shipping}),
                    self._json([{"code": "SAVE10", "amount": total_discounts}]) if total_discounts > 0 else self._json([]),
                    "BRL",
                    round(subtotal, 2),
                    total_tax,
                    total_shipping,
                    total_discounts,
                    total_price,
                    status,
                    self._future_timestamp(1) if status == "open" else None,
                    self._timestamp(30) if status == "completed" else None,
                    self._json({}),
                    f"https://checkout.example.com/recover/{checkout_id}" if status == "abandoned" else None,
                    "created",
                    self._timestamp(60),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} checkouts")

    # ==========================================================================
    # LEVEL 3: THIRD LEVEL DEPENDENCIES
    # ==========================================================================

    def generate_product_categories(self, cursor: sqlite3.Cursor):
        """Generate product-category associations."""
        count = 0

        # ~80% of products have category associations
        for product_id in random.sample(self.product_ids, k=int(len(self.product_ids) * 0.8)):
            num_categories = random.randint(1, 3)
            categories = random.sample(self.category_ids, k=min(num_categories, len(self.category_ids)))

            for i, category_id in enumerate(categories):
                try:
                    cursor.execute(
                        """
                        INSERT INTO product_categories (product_id, category_id, position,
                            _status, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """,
                        (
                            product_id,
                            category_id,
                            i,
                            "created",
                            self._timestamp(300),
                            self._timestamp(30),
                        ),
                    )
                    count += 1
                except sqlite3.IntegrityError:
                    pass

        print(f"  ✓ Generated {count} product categories")

    def generate_inventory_levels(self, cursor: sqlite3.Cursor):
        """Generate inventory level records."""
        count = self.config["inventory_levels"]
        stock_statuses = ["sellable", "sellable", "sellable", "damaged", "quarantine", "expired"]

        generated = 0
        used_combinations = set()

        while generated < count:
            product_id = random.choice(self.product_ids)
            location_id = random.choice(self.location_ids)

            # Create unique key (simplified - not using batch/serial for uniqueness here)
            combo_key = f"{product_id}_{location_id}_{generated}"
            if combo_key in used_combinations:
                continue
            used_combinations.add(combo_key)

            level_id = self._uuid()
            self.inventory_level_ids.append(level_id)

            quantity = random.randint(0, 500)
            reserved = random.randint(0, min(50, quantity))
            stock_status = random.choice(stock_statuses)

            cursor.execute(
                """
                INSERT INTO inventory_levels (id, product_id, location_id, batch_number,
                    serial_number, expiry_date, quantity_on_hand, quantity_reserved,
                    stock_status, aisle_bin_slot, last_counted_at, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    level_id,
                    product_id,
                    location_id,
                    f"BATCH-{random.randint(1000, 9999)}" if random.random() > 0.5 else None,
                    f"SN-{random.randint(100000, 999999)}" if random.random() > 0.8 else None,
                    self._future_date(365) if random.random() > 0.7 else None,
                    quantity,
                    reserved,
                    stock_status,
                    f"A{random.randint(1,10)}-B{random.randint(1,20)}-S{random.randint(1,50)}" if random.random() > 0.4 else None,
                    self._timestamp(30) if random.random() > 0.5 else None,
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )
            generated += 1

        print(f"  ✓ Generated {count} inventory levels")

    def generate_transactions(self, cursor: sqlite3.Cursor):
        """Generate transaction records."""
        count = self.config["transactions"]
        transaction_types = ["sale", "sale", "sale", "purchase", "transfer", "return", "adjustment"]
        statuses = ["draft", "pending", "completed", "completed", "completed", "cancelled"]
        channels = ["web", "store", "mobile", "api"]

        for _ in range(count):
            transaction_id = self._uuid()
            self.transaction_ids.append(transaction_id)

            total_items = round(random.uniform(50, 5000), 2)
            total_shipping = round(random.uniform(0, 100), 2) if random.random() > 0.3 else 0
            total_discount = round(total_items * random.uniform(0, 0.2), 2) if random.random() > 0.5 else 0
            total_net = round(total_items + total_shipping - total_discount, 2)

            cursor.execute(
                """
                INSERT INTO transactions (id, type, status, channel, customer_id, supplier_id,
                    staff_id, currency, total_items, total_shipping, total_discount, total_net,
                    shipping_method, shipping_address, billing_address, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    transaction_id,
                    random.choice(transaction_types),
                    random.choice(statuses),
                    random.choice(channels),
                    self._random_choice_or_none(self.customer_ids, 0.1),
                    None,  # No suppliers table
                    self._random_choice_or_none(self.user_ids, 0.2),
                    "BRL",
                    total_items,
                    total_shipping,
                    total_discount,
                    total_net,
                    random.choice(["standard", "express", "pickup", None]),
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                        }
                    )
                    if random.random() > 0.3
                    else None,
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                        }
                    )
                    if random.random() > 0.5
                    else None,
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} transactions")

    def generate_orders(self, cursor: sqlite3.Cursor):
        """Generate order records."""
        count = self.config["orders"]
        statuses = ["open", "open", "confirmed", "processing", "completed", "cancelled"]
        payment_statuses = ["unpaid", "pending", "paid", "paid", "paid", "refunded"]
        fulfillment_statuses = ["unfulfilled", "partial", "fulfilled", "fulfilled"]
        channels = ["web", "store", "mobile", "phone"]

        for i in range(count):
            order_id = self._uuid()
            self.order_ids.append(order_id)

            subtotal = round(random.uniform(50, 5000), 2)
            total_discounts = round(subtotal * random.uniform(0, 0.2), 2)
            total_tax = round(subtotal * 0.1, 2)
            total_shipping = round(random.uniform(0, 100), 2)
            total_tip = round(random.uniform(0, 20), 2) if random.random() > 0.9 else 0
            total_price = round(subtotal - total_discounts + total_tax + total_shipping + total_tip, 2)

            customer_id = self._random_choice_or_none(self.customer_ids, 0.05)
            status = random.choice(statuses)

            customer_snapshot = {
                "name": self.fake.name(),
                "email": self.fake.email(),
                "phone": self.fake.phone_number(),
            }

            cursor.execute(
                """
                INSERT INTO orders (id, order_number, idempotency_key, channel, shop_id,
                    customer_id, status, payment_status, fulfillment_status, currency,
                    subtotal_price, total_discounts, total_tax, total_shipping, total_tip,
                    total_price, tax_lines, discount_codes, note, tags, custom_attributes,
                    metadata, customer_snapshot, billing_address, shipping_address, _status,
                    created_at, updated_at, cancelled_at, closed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    order_id,
                    1000 + i,
                    self._uuid(),
                    random.choice(channels),
                    random.choice(self.shop_ids),
                    customer_id,
                    status,
                    random.choice(payment_statuses),
                    random.choice(fulfillment_statuses),
                    "BRL",
                    subtotal,
                    total_discounts,
                    total_tax,
                    total_shipping,
                    total_tip,
                    total_price,
                    self._json([{"name": "ICMS", "rate": 0.1, "amount": total_tax}]),
                    self._json([{"code": "SAVE10", "amount": total_discounts}]) if total_discounts > 0 else self._json([]),
                    self.fake.paragraph(nb_sentences=1) if random.random() > 0.8 else None,
                    self._json(random.sample(["urgent", "gift", "fragile", "bulk"], k=random.randint(0, 2))),
                    self._json([]),
                    self._json({"source": "website"}),
                    self._json(customer_snapshot),
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                            "country": "BR",
                        }
                    ),
                    self._json(
                        {
                            "address1": self.fake.street_address(),
                            "city": self.fake.city(),
                            "state": self.fake.state_abbr(),
                            "postal_code": self.fake.postcode(),
                            "country": "BR",
                        }
                    ),
                    "created",
                    self._timestamp(365),
                    self._timestamp(30),
                    self._timestamp(60) if status == "cancelled" else None,
                    self._timestamp(30) if status == "completed" else None,
                ),
            )

        print(f"  ✓ Generated {count} orders")

    def generate_inquiries(self, cursor: sqlite3.Cursor):
        """Generate inquiry records."""
        count = self.config["inquiries"]
        inquiry_types = ["general", "order", "product", "shipping", "return", "complaint"]
        statuses = ["new", "open", "pending", "resolved", "closed"]
        priorities = ["low", "normal", "normal", "high", "urgent"]
        sources = ["web_form", "email", "phone", "chat", "social"]
        departments = ["sales", "support", "shipping", "billing", "technical"]

        for i in range(count):
            inquiry_id = self._uuid()
            self.inquiry_ids.append(inquiry_id)

            cursor.execute(
                """
                INSERT INTO inquiries (id, protocol_number, type, status, priority, source,
                    customer_id, requester_data, department, assigned_staff_id, subject,
                    related_order_id, related_product_id, metadata, sla_due_at, resolved_at,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    inquiry_id,
                    f"INQ-{2024}{i:06d}",
                    random.choice(inquiry_types),
                    random.choice(statuses),
                    random.choice(priorities),
                    random.choice(sources),
                    self._random_choice_or_none(self.customer_ids, 0.3),
                    self._json({"name": self.fake.name(), "email": self.fake.email(), "phone": self.fake.phone_number()}),
                    random.choice(departments),
                    self._random_choice_or_none(self.user_ids, 0.4),
                    self.fake.sentence(nb_words=6),
                    self._random_choice_or_none(self.order_ids, 0.7) if random.random() > 0.5 else None,
                    self._random_choice_or_none(self.product_ids, 0.8) if random.random() > 0.7 else None,
                    self._json({}),
                    self._future_timestamp(3) if random.random() > 0.3 else None,
                    self._timestamp(30) if random.random() > 0.6 else None,
                    "created",
                    self._timestamp(90),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} inquiries")

    # ==========================================================================
    # LEVEL 4: FOURTH LEVEL DEPENDENCIES
    # ==========================================================================

    def generate_transaction_items(self, cursor: sqlite3.Cursor):
        """Generate transaction item records."""
        count = 0

        for transaction_id in self.transaction_ids:
            num_items = random.randint(1, 5)

            for _ in range(num_items):
                product_id = self._random_choice_or_none(self.product_ids, 0.05)
                quantity = random.randint(1, 10)
                unit_price = round(random.uniform(10, 1000), 2)
                unit_cost = round(unit_price * random.uniform(0.4, 0.7), 2)

                cursor.execute(
                    """
                    INSERT INTO transaction_items (id, transaction_id, product_id, sku_snapshot,
                        name_snapshot, quantity, unit_price, unit_cost, attributes_snapshot,
                        tax_details, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        transaction_id,
                        product_id,
                        f"SKU-{random.randint(100000, 999999)}",
                        self.fake.word().title() + " " + self.fake.word().title(),
                        quantity,
                        unit_price,
                        unit_cost,
                        self._json({"color": random.choice(["Preto", "Branco", "Azul"])}),
                        self._json({"tax_rate": 0.1, "tax_amount": round(unit_price * quantity * 0.1, 2)}),
                        "created",
                        self._timestamp(300),
                        self._timestamp(30),
                    ),
                )
                count += 1

        print(f"  ✓ Generated {count} transaction items")

    def generate_payments(self, cursor: sqlite3.Cursor):
        """Generate payment records."""
        count = self.config["payments"]
        providers = ["pagarme", "stripe", "mercadopago", "paypal", "pix_manual"]
        methods = ["credit_card", "debit_card", "pix", "boleto", "cash"]
        statuses = ["pending", "authorized", "captured", "captured", "captured", "failed", "voided"]
        risk_levels = ["low", "low", "medium", "high"]

        for _ in range(count):
            payment_id = self._uuid()
            self.payment_ids.append(payment_id)

            transaction_id = random.choice(self.transaction_ids)
            amount = round(random.uniform(20, 3000), 2)
            status = random.choice(statuses)

            cursor.execute(
                """
                INSERT INTO payments (id, transaction_id, amount, currency, provider, method,
                    installments, status, provider_transaction_id, authorization_code,
                    payment_details, risk_level, _status, created_at, updated_at,
                    authorized_at, captured_at, voided_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    payment_id,
                    transaction_id,
                    amount,
                    "BRL",
                    random.choice(providers),
                    random.choice(methods),
                    random.choice([1, 1, 1, 2, 3, 6, 10, 12]),
                    status,
                    f"txn_{self.fake.uuid4()[:8]}",
                    f"AUTH{random.randint(100000, 999999)}" if status in ["authorized", "captured"] else None,
                    self._json({"card_brand": random.choice(["visa", "mastercard", "elo"]), "last_digits": str(random.randint(1000, 9999))}),
                    random.choice(risk_levels),
                    "created",
                    self._timestamp(300),
                    self._timestamp(30),
                    self._timestamp(300) if status in ["authorized", "captured"] else None,
                    self._timestamp(290) if status == "captured" else None,
                    self._timestamp(280) if status == "voided" else None,
                ),
            )

        print(f"  ✓ Generated {count} payments")

    def generate_shipments(self, cursor: sqlite3.Cursor):
        """Generate shipment records."""
        count = self.config["shipments"]
        statuses = ["pending", "processing", "shipped", "shipped", "in_transit", "delivered", "delivered"]
        carriers = ["Correios", "Jadlog", "Total Express", "Azul Cargo", "Loggi", "Sequoia"]
        services = ["SEDEX", "PAC", "Expresso", "Econômico", "Same Day"]
        package_types = ["box", "envelope", "tube", "pallet"]

        for _ in range(count):
            shipment_id = self._uuid()
            self.shipment_ids.append(shipment_id)

            order_id = random.choice(self.order_ids)
            status = random.choice(statuses)

            cursor.execute(
                """
                INSERT INTO shipments (id, order_id, location_id, status, carrier_company,
                    carrier_service, tracking_number, tracking_url, weight_g, height_mm,
                    width_mm, depth_mm, package_type, shipping_label_url, invoice_url,
                    invoice_key, cost_amount, insurance_amount, estimated_delivery_at,
                    shipped_at, delivered_at, metadata, customs_info, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    shipment_id,
                    order_id,
                    self._random_choice_or_none(self.location_ids, 0.2),
                    status,
                    random.choice(carriers),
                    random.choice(services),
                    f"{random.choice(['BR', 'SS', 'LB'])}{random.randint(100000000, 999999999)}BR"
                    if status not in ["pending", "processing"]
                    else None,
                    f"https://tracking.example.com/{shipment_id}" if status not in ["pending", "processing"] else None,
                    random.randint(100, 30000),
                    random.randint(50, 500),
                    random.randint(100, 600),
                    random.randint(50, 400),
                    random.choice(package_types),
                    f"https://labels.example.com/{shipment_id}.pdf" if status != "pending" else None,
                    f"https://invoices.example.com/{shipment_id}.pdf" if status not in ["pending", "processing"] else None,
                    f"{random.randint(10000000000000000000000000000000000000000000, 99999999999999999999999999999999999999999999)}"
                    if status not in ["pending", "processing"]
                    else None,
                    round(random.uniform(10, 200), 2),
                    round(random.uniform(0, 50), 2) if random.random() > 0.7 else None,
                    self._future_timestamp(7) if status not in ["delivered"] else None,
                    self._timestamp(60) if status not in ["pending", "processing"] else None,
                    self._timestamp(30) if status == "delivered" else None,
                    self._json({}),
                    None,
                    "created",
                    self._timestamp(90),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} shipments")

    def generate_inquiry_messages(self, cursor: sqlite3.Cursor):
        """Generate inquiry message records."""
        count = 0
        sender_types = ["customer", "staff", "bot"]

        for inquiry_id in self.inquiry_ids:
            num_messages = random.randint(1, 8)

            for i in range(num_messages):
                sender_type = random.choice(sender_types)

                cursor.execute(
                    """
                    INSERT INTO inquiry_messages (id, inquiry_id, sender_type, sender_id,
                        body, is_internal_note, attachments, external_id, read_at,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        inquiry_id,
                        sender_type,
                        self._random_choice_or_none(self.user_ids, 0.3) if sender_type == "staff" else None,
                        self.fake.paragraph(nb_sentences=random.randint(1, 4)),
                        1 if random.random() > 0.9 and sender_type == "staff" else 0,
                        self._json([]) if random.random() > 0.8 else self._json([{"url": f"https://files.example.com/{self._uuid()}.pdf", "name": "documento.pdf"}]),
                        None,
                        self._timestamp(30) if random.random() > 0.3 else None,
                        "created",
                        self._timestamp(60),
                        self._timestamp(30),
                    ),
                )
                count += 1

        print(f"  ✓ Generated {count} inquiry messages")

    def generate_reviews(self, cursor: sqlite3.Cursor):
        """Generate review records."""
        count = self.config["reviews"]

        for _ in range(count):
            order_id = random.choice(self.order_ids)

            cursor.execute(
                """
                INSERT INTO reviews (id, order_id, customer_id, product_id, rating, title,
                    body, photos, videos, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    self._uuid(),
                    order_id,
                    self._random_choice_or_none(self.customer_ids, 0.2),
                    self._random_choice_or_none(self.product_ids, 0.1),
                    random.choices([1, 2, 3, 4, 5], weights=[5, 10, 15, 30, 40])[0],
                    self.fake.sentence(nb_words=5) if random.random() > 0.3 else None,
                    self.fake.paragraph(nb_sentences=random.randint(1, 3)) if random.random() > 0.2 else None,
                    self._json([f"https://photos.example.com/{self._uuid()}.jpg" for _ in range(random.randint(0, 3))]),
                    self._json([]),
                    "created",
                    self._timestamp(180),
                    self._timestamp(30),
                ),
            )

        print(f"  ✓ Generated {count} reviews")

    # ==========================================================================
    # LEVEL 5: FIFTH LEVEL DEPENDENCIES
    # ==========================================================================

    def generate_inventory_movements(self, cursor: sqlite3.Cursor):
        """Generate inventory movement records."""
        count = 0

        # Generate movements for a subset of inventory levels
        for level_id in random.sample(self.inventory_level_ids, k=min(500, len(self.inventory_level_ids))):
            # Get current stock level
            cursor.execute(
                "SELECT quantity_on_hand, quantity_reserved FROM inventory_levels WHERE id = ?",
                (level_id,),
            )
            row = cursor.fetchone()
            if not row:
                continue

            current_qty, reserved_qty = row
            available_qty = current_qty - reserved_qty

            num_movements = random.randint(1, 5)

            for _ in range(num_movements):
                # Decide movement type based on available stock
                # Only allow 'out' if there's available stock
                if available_qty > 0 and random.random() > 0.4:
                    movement_type = "out"
                    # Ensure we don't exceed available stock
                    max_out = min(50, int(available_qty))
                    if max_out <= 0:
                        movement_type = "in"
                        quantity = random.randint(1, 50)
                    else:
                        quantity = random.randint(1, max_out)
                else:
                    movement_type = "in"
                    quantity = random.randint(1, 50)

                # Get the actual current stock (triggers update it)
                cursor.execute(
                    "SELECT quantity_on_hand, quantity_reserved FROM inventory_levels WHERE id = ?",
                    (level_id,),
                )
                current_row = cursor.fetchone()
                current_stock = current_row[0] if current_row else 0
                reserved = current_row[1] if current_row else 0

                previous_balance = current_stock
                if movement_type == "out":
                    # Double-check we have enough
                    if current_stock - reserved < quantity:
                        # Switch to 'in' movement instead
                        movement_type = "in"
                    new_balance = previous_balance + quantity if movement_type == "in" else previous_balance - quantity
                else:
                    new_balance = previous_balance + quantity

                cursor.execute(
                    """
                    INSERT INTO inventory_movements (id, transaction_id, inventory_level_id,
                        type, quantity, previous_balance, new_balance, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        self._random_choice_or_none(self.transaction_ids, 0.3),
                        level_id,
                        movement_type,
                        quantity,
                        previous_balance,
                        new_balance,
                        "created",
                        self._timestamp(180),
                        self._timestamp(30),
                    ),
                )
                count += 1

                # Update our tracking of available quantity
                if movement_type == "in":
                    available_qty += quantity
                else:
                    available_qty -= quantity

        print(f"  ✓ Generated {count} inventory movements")

    def generate_refunds(self, cursor: sqlite3.Cursor):
        """Generate refund records."""
        count = 0
        statuses = ["pending", "approved", "processed", "rejected"]
        reasons = [
            "Produto com defeito",
            "Produto diferente do anunciado",
            "Arrependimento",
            "Entrega atrasada",
            "Produto não recebido",
            "Duplicidade de cobrança",
            "Cancelamento do pedido",
        ]

        # ~10% of payments have refunds
        for payment_id in random.sample(self.payment_ids, k=int(len(self.payment_ids) * 0.1)):
            cursor.execute(
                """
                INSERT INTO refunds (id, payment_id, amount, status, reason, provider_refund_id,
                    _status, created_at, updated_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    self._uuid(),
                    payment_id,
                    round(random.uniform(10, 500), 2),
                    random.choice(statuses),
                    random.choice(reasons),
                    f"ref_{self.fake.uuid4()[:8]}" if random.random() > 0.3 else None,
                    "created",
                    self._timestamp(90),
                    self._timestamp(30),
                    self._random_choice_or_none(self.user_ids, 0.3),
                ),
            )
            count += 1

        print(f"  ✓ Generated {count} refunds")

    def generate_shipment_items(self, cursor: sqlite3.Cursor):
        """Generate shipment item records."""
        count = 0

        for shipment_id in self.shipment_ids:
            num_items = random.randint(1, 5)

            for _ in range(num_items):
                cursor.execute(
                    """
                    INSERT INTO shipment_items (id, shipment_id, order_item_id, quantity,
                        batch_number, serial_numbers, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        shipment_id,
                        self._uuid(),  # order_item_id (referenced but not FK)
                        random.randint(1, 5),
                        f"BATCH-{random.randint(1000, 9999)}" if random.random() > 0.5 else None,
                        self._json([f"SN-{random.randint(100000, 999999)}" for _ in range(random.randint(0, 3))]),
                        "created",
                        self._timestamp(90),
                        self._timestamp(30),
                    ),
                )
                count += 1

        print(f"  ✓ Generated {count} shipment items")

    def generate_shipment_events(self, cursor: sqlite3.Cursor):
        """Generate shipment event records."""
        count = 0
        event_statuses = [
            "object_posted",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "delivery_failed",
            "returned",
        ]
        event_descriptions = [
            "Objeto postado",
            "Objeto em trânsito - por favor aguarde",
            "Objeto saiu para entrega",
            "Objeto entregue ao destinatário",
            "Tentativa de entrega não realizada",
            "Objeto devolvido ao remetente",
        ]

        for shipment_id in self.shipment_ids:
            num_events = random.randint(1, 6)

            for i in range(num_events):
                idx = min(i, len(event_statuses) - 1)

                cursor.execute(
                    """
                    INSERT INTO shipment_events (id, shipment_id, status, description, location,
                        happened_at, raw_data, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        self._uuid(),
                        shipment_id,
                        event_statuses[idx],
                        event_descriptions[idx],
                        f"{self.fake.city()}, {self.fake.state_abbr()}",
                        self._timestamp(90 - i * 5),
                        self._json({"source": "carrier_api"}),
                        "created",
                        self._timestamp(90),
                        self._timestamp(30),
                    ),
                )
                count += 1

        print(f"  ✓ Generated {count} shipment events")


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic data for Uru database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python scripts/python/generate_synthetic_data.py --db-path ./data/uru.db
    python scripts/python/generate_synthetic_data.py --db-path ./data/uru.db --seed 12345
        """,
    )
    parser.add_argument(
        "--db-path",
        type=str,
        required=True,
        help="Path to the SQLite database file",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible data generation (default: 42)",
    )

    args = parser.parse_args()

    generator = SyntheticDataGenerator(db_path=args.db_path, seed=args.seed)
    generator.run()


if __name__ == "__main__":
    main()
