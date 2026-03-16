import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

try:
    supabase = create_client(url, key)
    # Try to fetch one row from the shops table
    data = supabase.table("shops").select("*").limit(1).execute()
    print("✅ CONNECTION SUCCESS: Found data:", data.data)
except Exception as e:
    print("❌ CONNECTION FAILED:", e)