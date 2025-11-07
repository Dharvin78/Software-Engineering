import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asset_manager_project.settings')
django.setup()

from django.db import connection
from assets.models import Asset

# Check table structure
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'assets_asset' 
        ORDER BY ordinal_position;
    """)
    
    print("\n" + "="*60)
    print("UPLOADDB DATABASE - assets_asset TABLE STRUCTURE")
    print("="*60)
    
    for row in cursor.fetchall():
        col_name, data_type, max_length = row
        length_info = f" ({max_length})" if max_length else ""
        print(f"  {col_name:20s} : {data_type}{length_info}")
    
    # Check if any assets exist
    cursor.execute("SELECT COUNT(*) FROM assets_asset;")
    count = cursor.fetchone()[0]
    
    print("\n" + "="*60)
    print(f"Total Assets in Database: {count}")
    print("="*60)
    
    if count > 0:
        print("\nExisting Assets:")
        assets = Asset.objects.all()
        for asset in assets:
            print(f"  - ID: {asset.id}, Name: {asset.name}, Category: {asset.category}")
    else:
        print("\nNo assets uploaded yet. Upload from http://localhost:3000")
    
print("\n✅ Database connection successful!")
print("✅ Uploaddb database is ready to store assets!")
print("\nYou can now:")
print("  1. Upload assets from http://localhost:3000")
print("  2. View assets in pgAdmin4:")
print("     - Servers → PostgreSQL → Databases → Uploaddb")
print("     - Schemas → public → Tables → assets_asset")
print("     - Right-click → View/Edit Data → All Rows")
