import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  obtenerDocumentosUsuario,
  toggleDocumento,
} from "../controllers/documentos.controller";

const documentosRouter = Router();

// GET /documentos → lista completa con tieneDocumento: true/false
documentosRouter.get("/", authMiddleware, obtenerDocumentosUsuario);

// POST /documentos/toggle/:tipoDocumentoId → activa/desactiva un documento
documentosRouter.post("/toggle/:tipoDocumentoId", authMiddleware, toggleDocumento);

export default documentosRouter;
