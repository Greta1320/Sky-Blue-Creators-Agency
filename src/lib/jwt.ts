// Utilidades de JWT SIN dependencias de Prisma/Node, para poder usarse
// también en el middleware (runtime Edge).
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./constants";

export const SESSION_COOKIE = "skyblue_session";
const TOKEN_TTL = "30d";

// Secreto de firma. En producción real usá AUTH_SECRET; el fallback existe
// solo para el modo demo desplegado sin variables de entorno.
function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "sky-blue-creators-demo-secret-cambiar-en-produccion-0001";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    name: payload.name,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub as string,
      role: payload.role as Role,
      name: (payload.name as string) ?? "",
      email: (payload.email as string) ?? "",
    };
  } catch {
    return null;
  }
}
