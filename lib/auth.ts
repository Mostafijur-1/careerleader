import jwt from "jsonwebtoken"

export type AuthUser = {
  id: string
  email: string
  type: "student" | "mentor" | "admin"
  name: string
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me"
const AUTH_COOKIE_NAME = "career_leader_token"
const AUTH_TOKEN_EXPIRY = "7d"

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: AUTH_TOKEN_EXPIRY })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthUser
}
