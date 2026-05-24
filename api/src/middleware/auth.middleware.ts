import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticación requerido" });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = verifyToken<{ sub: string; correo: string; nombre: string; apellidos: string }>(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
