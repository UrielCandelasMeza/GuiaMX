import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  obtenerResumenUltimaSesion,
  cerrarSesion,
} from "../controllers/sesiones.controller";

const sesionesRouter = Router();

// GET /sesiones/resumen → Resumen de la última sesión con historial
sesionesRouter.get("/resumen", authMiddleware, obtenerResumenUltimaSesion);

// POST /sesiones/cerrar → Genera resumen con LLM y expira la sesión
sesionesRouter.post("/cerrar", authMiddleware, cerrarSesion);

export default sesionesRouter;
