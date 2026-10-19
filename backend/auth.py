
import os

from fastapi import Header, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token

GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
ALLOWED_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ALLOWED_EMAILS", "").split(",")
    if email.strip()
}

#requires aunthentication
def require_auth(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token"
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        user = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except (ValueError, Exception):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google token"
        )

    if (
        user.get("email") not in ALLOWED_EMAILS
        or user.get("email_verified") is not True
    ):
        raise HTTPException(
            status_code=403,
            detail="Account not authorized"
        )

    return user
