import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

export function requireParent(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  if (req.session.role !== 'parent') {
    return res.status(403).json({ error: "Se requiere acceso de padre/madre" });
  }
  next();
}

export async function initializeFamilyData(familyId: string) {
  await Promise.all([
    storage.createPet({
      familyId,
      name: 'Pelusa',
      type: '🐶',
      hunger: 70,
      happiness: 60,
      health: 80,
      level: 1,
    }),
    storage.createInventory({
      familyId,
      food: 0,
      toys: 0,
      medicine: 1,
      basicFood: 3,
      snack: 0,
      ball: 1,
      rope: 1,
    }),
    storage.createGameState({
      familyId,
      points: 150,
    }),
  ]);
}
