#!/usr/bin/env python3
"""
Render -> Supabase write verification script.

What this script does:
1) Sends POST/GET requests to your Render API.
2) Verifies DB writes directly in Supabase PostgreSQL for non-demo flows.
3) Logs status codes, response payloads, and DB-related API errors.
4) Supports demo-token smoke tests and real write tests with throwaway users.

Important:
- Demo accounts in this codebase are intentionally simulated in route handlers.
  Demo token requests return success responses but DO NOT commit DB rows.
- To verify actual writes, run mode=write or mode=both.
"""

from __future__ import annotations

import json
import os
import sys
import time
import traceback
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple
from urllib import error, parse, request

import psycopg2
from dotenv import load_dotenv


load_dotenv()


@dataclass
class ApiResult:
    status: int
    data: Dict[str, Any]
    raw: str


class TestFailure(Exception):
    pass


def env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise TestFailure(f"Missing environment variable: {name}")
    return value


def now_tag() -> str:
    return time.strftime("%Y%m%d%H%M%S")


def log(msg: str) -> None:
    print(msg)


def pretty(obj: Any) -> str:
    return json.dumps(obj, indent=2, sort_keys=True)


def api_call(
    base_url: str,
    method: str,
    path: str,
    body: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None,
    timeout: int = 30,
) -> ApiResult:
    url = base_url.rstrip("/") + path
    data_bytes = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data_bytes = json.dumps(body).encode("utf-8")

    req = request.Request(url=url, data=data_bytes, headers=headers, method=method.upper())

    try:
        with request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                payload = json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                payload = {"_raw": raw}
            return ApiResult(status=resp.getcode(), data=payload, raw=raw)
    except error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = {"_raw": raw}
        return ApiResult(status=e.code, data=payload, raw=raw)


def log_api_result(label: str, result: ApiResult) -> None:
    log(f"\n[{label}] status={result.status}")
    if result.data:
        log(pretty(result.data))
    else:
        log("<empty response>")

    error_text = str(result.data.get("error", "")) if isinstance(result.data, dict) else ""
    if result.status >= 500 or "database" in error_text.lower() or "db" in error_text.lower():
        log(f"[DB-ERROR-CANDIDATE] {label}: status={result.status}, error={error_text or result.raw}")


def expect_status(result: ApiResult, allowed: Tuple[int, ...], step: str) -> None:
    if result.status not in allowed:
        raise TestFailure(
            f"{step} failed: expected status in {allowed}, got {result.status}. Body={result.raw}"
        )


def get_token(base_url: str, email: str, password: str) -> str:
    r = api_call(
        base_url,
        "POST",
        "/api/login",
        body={"email": email, "password": password},
    )
    log_api_result(f"login:{email}", r)
    expect_status(r, (200,), f"Login for {email}")

    token = r.data.get("access_token")
    if not token:
        raise TestFailure(f"Login for {email} returned no access_token")
    return token


def register_user(base_url: str, payload: Dict[str, Any]) -> None:
    r = api_call(base_url, "POST", "/api/register", body=payload)
    log_api_result(f"register:{payload['email']}", r)

    if r.status in (200, 201):
        return
    if r.status == 409:
        log(f"[WARN] User already exists: {payload['email']}")
        return
    raise TestFailure(f"Registration failed for {payload['email']}: {r.raw}")


def connect_db() -> Any:
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise TestFailure("Set SUPABASE_DB_URL or DATABASE_URL for direct DB verification")

    parsed = parse.urlparse(db_url)
    if parsed.scheme.startswith("postgres") and "sslmode=" not in db_url:
        sep = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{sep}sslmode=require"

    return psycopg2.connect(db_url)


def row_exists(cur: Any, query: str, params: Tuple[Any, ...]) -> bool:
    cur.execute(query, params)
    row = cur.fetchone()
    return bool(row and row[0] >= 1)


def run_demo_mode(base_url: str) -> None:
    log("\n=== DEMO MODE: API smoke checks (simulated, no DB commits expected) ===")

    demo_instructor_token = get_token(
        base_url,
        os.getenv("DEMO_INSTRUCTOR_EMAIL", "instructor@demo.com"),
        os.getenv("DEMO_PASSWORD", "demo1234"),
    )
    demo_student_token = get_token(
        base_url,
        os.getenv("DEMO_STUDENT_EMAIL", "student@demo.com"),
        os.getenv("DEMO_PASSWORD", "demo1234"),
    )

    unique_title = f"DEMO-COURSE-{now_tag()}"

    create_course = api_call(
        base_url,
        "POST",
        "/api/courses",
        body={
            "title": unique_title,
            "description": "demo smoke",
            "price": 1234,
            "total_seats": 10,
        },
        token=demo_instructor_token,
    )
    log_api_result("demo:create_course", create_course)
    expect_status(create_course, (201,), "Demo create course")

    reserve = api_call(
        base_url,
        "POST",
        "/api/reserve",
        body={"course_id": 1},
        token=demo_student_token,
    )
    log_api_result("demo:reserve", reserve)
    expect_status(reserve, (201,), "Demo reserve")

    pay = api_call(
        base_url,
        "POST",
        "/api/payment",
        body={"reservation_id": 1, "amount": 4999, "payment_type": "upi"},
        token=demo_student_token,
    )
    log_api_result("demo:payment", pay)
    expect_status(pay, (201,), "Demo payment")

    enrollments = api_call(base_url, "GET", "/api/enrollments", token=demo_student_token)
    log_api_result("demo:get_enrollments", enrollments)
    expect_status(enrollments, (200,), "Demo get enrollments")

    demo_msgs = [
        str(create_course.data.get("message", "")),
        str(reserve.data.get("message", "")),
        str(pay.data.get("message", "")),
    ]
    if all("demo mode" in m.lower() for m in demo_msgs):
        log("[INFO] Demo responses confirmed. These requests are simulated by server code and do not write DB rows.")
    else:
        log("[WARN] One or more demo responses did not contain 'Demo mode'. Review route behavior.")


def run_real_write_mode(base_url: str) -> None:
    log("\n=== WRITE MODE: end-to-end DB write verification against Supabase ===")

    tag = now_tag()
    instructor_email = f"write.instructor.{tag}@example.com"
    student_email = f"write.student.{tag}@example.com"
    password = os.getenv("TEST_PASSWORD", "Passw0rd!123")

    register_user(
        base_url,
        {
            "name": f"Write Instructor {tag}",
            "email": instructor_email,
            "password": password,
            "role": "instructor",
            "specialization": "automation",
        },
    )
    register_user(
        base_url,
        {
            "name": f"Write Student {tag}",
            "email": student_email,
            "password": password,
            "role": "student",
            "phone": "9999999999",
        },
    )

    instructor_token = get_token(base_url, instructor_email, password)
    student_token = get_token(base_url, student_email, password)

    conn = connect_db()
    conn.autocommit = True

    try:
        with conn.cursor() as cur:
            course_title = f"WRITE-COURSE-{tag}"

            create_course = api_call(
                base_url,
                "POST",
                "/api/courses",
                body={
                    "title": course_title,
                    "description": "write verification",
                    "price": 2222,
                    "total_seats": 5,
                },
                token=instructor_token,
            )
            log_api_result("write:create_course", create_course)
            expect_status(create_course, (201,), "Write create course")

            course_id = create_course.data.get("course", {}).get("course_id")
            if not course_id:
                raise TestFailure("Create course returned no course_id")

            if not row_exists(cur, "SELECT COUNT(*) FROM course WHERE course_id = %s", (course_id,)):
                raise TestFailure(f"DB verification failed: course_id={course_id} not found in Supabase")
            log(f"[DB-OK] course row exists (course_id={course_id})")

            reserve = api_call(
                base_url,
                "POST",
                "/api/reserve",
                body={"course_id": course_id},
                token=student_token,
            )
            log_api_result("write:reserve", reserve)
            expect_status(reserve, (201,), "Write reserve")

            reservation_id = reserve.data.get("reservation", {}).get("reservation_id")
            if not reservation_id:
                raise TestFailure("Reserve returned no reservation_id")

            if not row_exists(
                cur,
                "SELECT COUNT(*) FROM reservation WHERE reservation_id = %s",
                (reservation_id,),
            ):
                raise TestFailure(
                    f"DB verification failed: reservation_id={reservation_id} not found in Supabase"
                )
            log(f"[DB-OK] reservation row exists (reservation_id={reservation_id})")

            pay = api_call(
                base_url,
                "POST",
                "/api/payment",
                body={"reservation_id": reservation_id, "amount": 2222, "payment_type": "upi"},
                token=student_token,
            )
            log_api_result("write:payment", pay)
            expect_status(pay, (201,), "Write payment")

            payment_id = pay.data.get("payment", {}).get("payment_id")
            enrollment_id = pay.data.get("enrollment", {}).get("enrollment_id")
            if not payment_id or not enrollment_id:
                raise TestFailure("Payment response missing payment_id or enrollment_id")

            if not row_exists(cur, "SELECT COUNT(*) FROM payment WHERE payment_id = %s", (payment_id,)):
                raise TestFailure(f"DB verification failed: payment_id={payment_id} not found in Supabase")
            log(f"[DB-OK] payment row exists (payment_id={payment_id})")

            if not row_exists(
                cur,
                "SELECT COUNT(*) FROM enrollment WHERE enrollment_id = %s",
                (enrollment_id,),
            ):
                raise TestFailure(
                    f"DB verification failed: enrollment_id={enrollment_id} not found in Supabase"
                )
            log(f"[DB-OK] enrollment row exists (enrollment_id={enrollment_id})")

            log("\n[PASS] Real write verification completed successfully.")

    finally:
        conn.close()


def main() -> int:
    base_url = env("RENDER_BASE_URL", "https://your-app.onrender.com")
    mode = os.getenv("TEST_MODE", "both").strip().lower()

    if mode not in {"demo", "write", "both"}:
        raise TestFailure("TEST_MODE must be one of: demo, write, both")

    log("Render/Supabase verification starting...")
    log(f"Base URL: {base_url}")
    log(f"Mode: {mode}")

    if mode in {"demo", "both"}:
        run_demo_mode(base_url)

    if mode in {"write", "both"}:
        run_real_write_mode(base_url)

    log("\nAll selected tests completed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except TestFailure as e:
        log(f"\n[FAIL] {e}")
        raise SystemExit(1)
    except Exception as e:
        log(f"\n[UNEXPECTED-ERROR] {e}")
        traceback.print_exc()
        raise SystemExit(2)
