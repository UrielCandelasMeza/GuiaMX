import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, apellidos, correo, password } = req.body;

    if (!nombre || !apellidos || !correo || !password) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios: nombre, apellidos, correo y password",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { correo },
    });

    if (existingUser) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nombre,
        apellidos,
        correo,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
    });
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return res.status(500).json({ error: "Ocurrió un error en el servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body;
    console.log("[LOGIN] Recibido POST /auth/login con:", { correo });

    if (!correo || !password) {
      return res
        .status(400)
        .json({ error: "Correo y password son obligatorios" });
    }

    const user = await prisma.user.findUnique({
      where: { correo },
    });

    if (!user) {
      console.log("[LOGIN] Usuario no encontrado:", correo);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("[LOGIN] Contraseña inválida para:", correo);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = signToken({
      sub: user.id,
      correo: user.correo,
      nombre: user.nombre,
      apellidos: user.apellidos,
    });

    console.log("[LOGIN] Login exitoso para:", correo);
    return res.status(200).json({
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
  } catch (error) {
    console.error("[LOGIN] Error en login:", error);
    return res.status(500).json({ error: "Ocurrió un error en el servidor" });
  }
};
