import "express";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      nombre: string;
      apellidos: string;
      correo: string;
    };
  }
}
