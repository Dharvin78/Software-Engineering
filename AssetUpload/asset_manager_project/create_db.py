import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to PostgreSQL server
conn = psycopg2.connect(
    host='localhost',
    user='postgres',
    password='#WongGh24%',
    dbname='postgres'
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

# Create database
cur = conn.cursor()
try:
    cur.execute('CREATE DATABASE "Uploaddb"')
    print('Database "Uploaddb" created successfully!')
except psycopg2.errors.DuplicateDatabase:
    print('Database "Uploaddb" already exists.')
except Exception as e:
    print(f'Error creating database: {e}')
finally:
    cur.close()
    conn.close()
