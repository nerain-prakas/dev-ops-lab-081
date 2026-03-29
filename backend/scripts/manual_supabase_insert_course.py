#!/usr/bin/env python3
"""Insert one course directly into Supabase Postgres for verification.

Usage (Windows cmd example):
  set SUPABASE_DB_URL=postgresql://.../postgres?sslmode=require
    d:\\codes\\OOSE\\.venv\\Scripts\\python.exe backend\\scripts\\manual_supabase_insert_course.py
"""

from __future__ import annotations

import os
import sys
import time
from urllib import parse

import psycopg2


def build_db_url() -> str:
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("Set SUPABASE_DB_URL or DATABASE_URL")

    parsed = parse.urlparse(db_url)
    if parsed.scheme.startswith("postgres") and "sslmode=" not in db_url:
        sep = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{sep}sslmode=require"
    return db_url


def main() -> int:
    db_url = build_db_url()
    title = f"MANUAL-SUPABASE-COURSE-{time.strftime('%Y%m%d%H%M%S')}"

    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT i.instructor_id, u.name
                FROM instructor i
                JOIN users u ON u.user_id = i.user_id
                ORDER BY u.user_id DESC
                LIMIT 1
                """
            )
            row = cur.fetchone()
            if not row:
                print("[FAIL] No instructor row found; cannot insert course.")
                return 1

            instructor_id, instructor_name = row

            cur.execute(
                """
                INSERT INTO course (instructor_id, title, description, price, total_seats, available_seats)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING course_id
                """,
                (
                    str(instructor_id),
                    title,
                    "Inserted directly via Supabase connection",
                    1999.0,
                    20,
                    20,
                ),
            )
            course_id = cur.fetchone()[0]

            cur.execute("SELECT title, price, total_seats FROM course WHERE course_id = %s", (str(course_id),))
            verify = cur.fetchone()

            print("[PASS] Direct insert into Supabase succeeded")
            print(f"  instructor_id={instructor_id}")
            print(f"  instructor_name={instructor_name}")
            print(f"  course_id={course_id}")
            print(f"  row={verify}")
            return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
