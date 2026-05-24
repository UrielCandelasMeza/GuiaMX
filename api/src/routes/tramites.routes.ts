import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarTramites,
  obtenerTramite,
  iniciarTramite,
  obtenerMisTramites,
  actualizarEstadoPaso,
} from "../controllers/tramites.controller";

const tramitesRouter = Router();

// IMPORTANTE: /mis-tramites debe ir ANTES de /:id para que Express no lo interprete como un id
tramitesRouter.get("/mis-tramites", authMiddleware, obtenerMisTramites);
tramitesRouter.patch(
  "/mis-tramites/:tramiteUsuarioId/pasos/:pasoId",
  authMiddleware,
  actualizarEstadoPaso,
);

tramitesRouter.get("/", authMiddleware, listarTramites);
tramitesRouter.get("/:id", authMiddleware, obtenerTramite);
tramitesRouter.post("/:id/iniciar", authMiddleware, iniciarTramite);

export default tramitesRouter;
