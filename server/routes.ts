import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertMissionSchema } from "@shared/schema";
import type { WeeklyGameData } from "@shared/schema";
import { hashPassword, comparePassword, requireAuth, requireParent, initializeFamilyData } from "./auth";
import { randomUUID } from "crypto";
import { getCosmeticById, COSMETIC_CATALOG } from "@shared/cosmetics";

const ACHIEVEMENT_TYPES = {
  FIRST_MISSION: { type: 'first_mission', title: 'First Steps', description: 'Complete your first mission!', icon: '🌟' },
  FIVE_MISSIONS: { type: 'five_missions', title: 'Mission Master', description: 'Complete 5 missions', icon: '🏆' },
  TEN_MISSIONS: { type: 'ten_missions', title: 'Champion', description: 'Complete 10 missions', icon: '👑' },
  MEMORY_WIN: { type: 'memory_win', title: 'Memory Champ', description: 'Win the memory game', icon: '🧠' },
  CATCH_STAR: { type: 'catch_star', title: 'Catch Star', description: 'Score 10+ in catch game', icon: '⭐' },
  PET_HAPPY: { type: 'pet_happy', title: 'Happy Pet', description: 'Get your pet to 90%+ happiness', icon: '😊' },
  HEALTHY_PET: { type: 'healthy_pet', title: 'Healthy Pet', description: 'Get your pet to 90%+ health', icon: '💪' },
  POINTS_100: { type: 'points_100', title: 'Point Collector', description: 'Earn 100 points total', icon: '💎' },
  POINTS_500: { type: 'points_500', title: 'Point Master', description: 'Earn 500 points total', icon: '💰' },
} as const;

const CONSUMABLE_ITEMS: Record<string, { price: number; stat: 'hunger' | 'happiness' | 'health'; amount: number; inventoryField: string }> = {
  basicFood: { price: 10, stat: 'hunger', amount: 30, inventoryField: 'basicFood' },
  snack: { price: 20, stat: 'hunger', amount: 60, inventoryField: 'snack' },
  ball: { price: 10, stat: 'happiness', amount: 30, inventoryField: 'ball' },
  rope: { price: 20, stat: 'happiness', amount: 60, inventoryField: 'rope' },
  medicine: { price: 15, stat: 'health', amount: 30, inventoryField: 'medicine' },
};

const PERMANENT_ITEMS: Record<string, { price: number; type: 'bowl' | 'house'; stateField: string; activeField: string }> = {
  bowl_basic: { price: 80, type: 'bowl', stateField: 'ownedBowlBasic', activeField: 'activeBowl' },
  bowl_special: { price: 150, type: 'bowl', stateField: 'ownedBowlSpecial', activeField: 'activeBowl' },
  house_basic: { price: 120, type: 'house', stateField: 'ownedHouseBasic', activeField: 'activeHouse' },
  house_fancy: { price: 200, type: 'house', stateField: 'ownedHouseFancy', activeField: 'activeHouse' },
};

function getBowlBonus(activeBowl: string | null): number {
  if (activeBowl === 'bowl_special') return 20;
  if (activeBowl === 'bowl_basic') return 10;
  return 0;
}

function getHouseBonus(activeHouse: string | null): number {
  if (activeHouse === 'house_fancy') return 20;
  if (activeHouse === 'house_basic') return 10;
  return 0;
}

function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeeklyGameData(gameState: { weeklyGameData: string | null }, currentWeekId: string): WeeklyGameData {
  if (gameState.weeklyGameData) {
    try {
      const data = JSON.parse(gameState.weeklyGameData) as WeeklyGameData;
      if (data.weekId === currentWeekId) return data;
    } catch {}
  }
  return { weekId: currentWeekId, memoryPlays: 0, catchPlays: 0, memoryBestScore: 0, catchBestScore: 0 };
}

const MINIGAME_MISSION_POOL = [
  { title: 'Juega Memoria 2 veces', description: 'Completa el juego de memoria 2 veces esta semana', autoDetect: 'play_memory_2', progressTarget: 2, reward: 25, statBonus: 'happiness', statAmount: 5 },
  { title: 'Juega Atrapar Estrellas 2 veces', description: 'Juega el juego de atrapar 2 veces esta semana', autoDetect: 'play_catch_2', progressTarget: 2, reward: 25, statBonus: 'happiness', statAmount: 5 },
  { title: 'Atrapa 15 estrellas', description: 'Consigue al menos 15 estrellas en Atrapar Estrellas', autoDetect: 'catch_score_15', progressTarget: 1, reward: 30, statBonus: 'happiness', statAmount: 10 },
  { title: 'Juega Memoria 3 veces', description: 'Completa el juego de memoria 3 veces esta semana', autoDetect: 'play_memory_3', progressTarget: 3, reward: 30, statBonus: 'happiness', statAmount: 8 },
  { title: 'Atrapa 20 estrellas', description: 'Consigue al menos 20 estrellas en Atrapar Estrellas', autoDetect: 'catch_score_20', progressTarget: 1, reward: 35, statBonus: 'happiness', statAmount: 10 },
  { title: 'Juega ambos minijuegos', description: 'Juega Memoria y Atrapar Estrellas al menos 1 vez', autoDetect: 'play_both_games', progressTarget: 2, reward: 30, statBonus: 'happiness', statAmount: 8 },
];

function pickMinigameMissions(weekId: string): typeof MINIGAME_MISSION_POOL[number][] {
  let hash = 0;
  for (let i = 0; i < weekId.length; i++) {
    hash = ((hash << 5) - hash) + weekId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const pool = [...MINIGAME_MISSION_POOL];
  const idx1 = hash % pool.length;
  const picked1 = pool[idx1];
  pool.splice(idx1, 1);
  const idx2 = (hash >> 4) % pool.length;
  const picked2 = pool[idx2];

  return [picked1, picked2];
}

async function generateWeeklyMissions(familyId: string, weekId: string) {
  const existing = await storage.getMissionsByWeek(familyId, weekId);
  if (existing.length > 0) return existing;

  await storage.deleteOldWeekMissions(familyId, weekId);

  const systemMissions = [
    {
      familyId, weekId, type: 'system' as const, title: 'Juega un minijuego hoy',
      description: 'Completa cualquier minijuego al menos 1 vez', duration: 'Diaria',
      points: 20, statBonus: 'happiness', statAmount: 5, autoDetect: 'play_minigame',
      progress: 0, progressTarget: 1, completed: false, approved: false, icon: 'star',
    },
    {
      familyId, weekId, type: 'system' as const, title: 'Alcanza 20 puntos en un minijuego',
      description: 'Logra al menos 20 puntos en cualquier minijuego', duration: 'Semanal',
      points: 30, statBonus: 'happiness', statAmount: 10, autoDetect: 'score_20',
      progress: 0, progressTarget: 1, completed: false, approved: false, icon: 'star',
    },
    {
      familyId, weekId, type: 'system' as const, title: 'Cuida a tu mascota 3 días seguidos',
      description: 'Abre la app 3 días consecutivos', duration: 'Semanal',
      points: 40, statBonus: 'health', statAmount: 10, autoDetect: 'consecutive_3',
      progress: 0, progressTarget: 3, completed: false, approved: false, icon: 'heart',
    },
  ];

  const minigamePicks = pickMinigameMissions(weekId);
  const minigameMissions = minigamePicks.map(m => ({
    familyId, weekId, type: 'minigame' as const, title: m.title,
    description: m.description, duration: 'Semanal', points: m.reward,
    statBonus: m.statBonus, statAmount: m.statAmount, autoDetect: m.autoDetect,
    progress: 0, progressTarget: m.progressTarget, completed: false, approved: false,
    icon: 'gamepad',
  }));

  const allMissions = [...systemMissions, ...minigameMissions];
  const created = [];
  for (const m of allMissions) {
    created.push(await storage.createMission(m));
  }
  return created;
}

async function checkAndAutoCompleteMissions(familyId: string, weekId: string, gameData: WeeklyGameData, consecutiveDays: number) {
  const weekMissions = await storage.getMissionsByWeek(familyId, weekId);
  const gameState = await storage.getGameState(familyId);
  const pet = await storage.getPet(familyId);

  for (const mission of weekMissions) {
    if (mission.completed || mission.approved) continue;
    if (!mission.autoDetect) continue;

    let newProgress = mission.progress;
    let shouldComplete = false;

    switch (mission.autoDetect) {
      case 'play_minigame':
        newProgress = Math.min(mission.progressTarget, gameData.memoryPlays + gameData.catchPlays > 0 ? 1 : 0);
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'score_100':
      case 'score_20': {
        const maxScore = Math.max(gameData.memoryBestScore, gameData.catchBestScore);
        const target = mission.autoDetect === 'score_20' ? 20 : 100;
        newProgress = maxScore >= target ? 1 : 0;
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      }
      case 'consecutive_3':
        newProgress = Math.min(mission.progressTarget, consecutiveDays);
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'play_memory_2':
        newProgress = Math.min(mission.progressTarget, gameData.memoryPlays);
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'play_memory_3':
        newProgress = Math.min(mission.progressTarget, gameData.memoryPlays);
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'play_catch_2':
        newProgress = Math.min(mission.progressTarget, gameData.catchPlays);
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'catch_score_15':
        newProgress = gameData.catchBestScore >= 15 ? 1 : 0;
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'catch_score_20':
        newProgress = gameData.catchBestScore >= 20 ? 1 : 0;
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      case 'play_both_games': {
        const memPlayed = gameData.memoryPlays > 0 ? 1 : 0;
        const catchPlayed = gameData.catchPlays > 0 ? 1 : 0;
        newProgress = memPlayed + catchPlayed;
        shouldComplete = newProgress >= mission.progressTarget;
        break;
      }
    }

    if (newProgress !== mission.progress || shouldComplete) {
      const updates: any = { progress: newProgress };
      if (shouldComplete && !mission.completed) {
        updates.completed = true;
        updates.approved = true;
        updates.completedAt = new Date().toISOString();

        if (gameState && pet) {
          await storage.updateGameState(gameState.id, { points: gameState.points + mission.points });
          if (mission.statBonus && mission.statAmount > 0) {
            const statKey = mission.statBonus as 'hunger' | 'happiness' | 'health';
            const petUpdate: any = {};
            petUpdate[statKey] = Math.min(100, (pet as any)[statKey] + mission.statAmount);
            await storage.updatePet(pet.id, petUpdate);
          }
          await storage.createMissionLog({
            familyId, missionTitle: mission.title, missionType: mission.type,
            reward: mission.points, weekId,
          });
        }
      }
      await storage.updateMission(mission.id, updates);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Health check para Render.com
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ========================
  // AUTH ROUTES
  // ========================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
      }
      if (!['parent', 'child'].includes(role)) {
        return res.status(400).json({ error: "El rol debe ser 'padre' o 'hijo'" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }

      const hashedPassword = await hashPassword(password);
      const familyId = randomUUID();

      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        familyId,
      });

      if (role === 'parent') {
        await initializeFamilyData(familyId);
      }

      req.session.userId = user.id;
      req.session.familyId = user.familyId;
      req.session.role = user.role;
      req.session.username = user.username;

      res.json({ id: user.id, username: user.username, role: user.role, familyId: user.familyId });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: "Error al registrarse" });
    }
  });

  app.post("/api/auth/join-family", async (req, res) => {
    try {
      const { username, password, role, familyId } = req.body;

      if (!username || !password || !familyId) {
        return res.status(400).json({ error: "Usuario, contraseña y código familiar son obligatorios" });
      }
      if (!['parent', 'child'].includes(role)) {
        return res.status(400).json({ error: "El rol debe ser 'padre' o 'hijo'" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }

      const pet = await storage.getPet(familyId);
      if (!pet) {
        return res.status(404).json({ error: "Familia no encontrada. Verifica el código familiar." });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        familyId,
      });

      req.session.userId = user.id;
      req.session.familyId = user.familyId;
      req.session.role = user.role;
      req.session.username = user.username;

      res.json({ id: user.id, username: user.username, role: user.role, familyId: user.familyId });
    } catch (error) {
      console.error('Join family error:', error);
      res.status(500).json({ error: "Error al unirse a la familia" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      req.session.userId = user.id;
      req.session.familyId = user.familyId;
      req.session.role = user.role;
      req.session.username = user.username;

      res.json({ id: user.id, username: user.username, role: user.role, familyId: user.familyId });
    } catch (error) {
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "No autenticado" });
    }
    res.json({
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role,
      familyId: req.session.familyId,
    });
  });

  app.post("/api/auth/verify-parent", requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "La contraseña es obligatoria" });
      }

      const familyId = req.session.familyId!;
      const parent = await storage.getParentByFamilyId(familyId);
      if (!parent) {
        return res.status(404).json({ error: "No se encontró una cuenta de padre/madre en esta familia" });
      }

      const valid = await comparePassword(password, parent.password);
      if (!valid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al verificar la contraseña" });
    }
  });

  // ========================
  // GAME DATA ROUTES (family-scoped)
  // ========================

  app.get("/api/game-data", requireAuth, async (req, res) => {
    try {
      const familyId = req.session.familyId!;
      const userId = req.session.userId!;
      const [pet, inventory, gameState, achievementList, cosmeticsList] = await Promise.all([
        storage.getPet(familyId),
        storage.getInventory(familyId),
        storage.getGameState(familyId),
        storage.getAchievements(familyId),
        storage.getOwnedCosmetics(familyId),
      ]);

      if (gameState && pet) {
        const now = new Date();
        const nowIso = now.toISOString();
        const hour = now.getHours();
        const isNight = hour >= 20 || hour < 6;
        const today = nowIso.split('T')[0];
        const currentWeekId = getWeekId(now);

        const petUpdates: Partial<typeof pet> = {};
        const stateUpdates: Partial<typeof gameState> = {};

        // Server-side stat decay based on elapsed time
        const lastDecay = gameState.lastDecayAt ? new Date(gameState.lastDecayAt) : null;
        if (lastDecay) {
          const elapsedMs = now.getTime() - lastDecay.getTime();
          const elapsedHours = elapsedMs / (1000 * 60 * 60);

          if (elapsedHours > 0.01) {
            const hungerDecay = 3 * elapsedHours;
            petUpdates.hunger = Math.max(0, pet.hunger - hungerDecay);

            const happinessDecay = 2 * elapsedHours;
            petUpdates.happiness = Math.max(0, pet.happiness - happinessDecay);

            let healthDecay = 0;
            if (gameState.hungerLowSince) {
              const lowSince = new Date(gameState.hungerLowSince);
              const hoursLow = (now.getTime() - lowSince.getTime()) / (1000 * 60 * 60);
              if (hoursLow >= 2) {
                healthDecay = 1 * elapsedHours;
              }
            }
            petUpdates.health = Math.max(0, pet.health - healthDecay);

            stateUpdates.lastDecayAt = nowIso;
          }
        } else {
          stateUpdates.lastDecayAt = nowIso;
        }

        // Track hungerLowSince
        const effectiveHunger = petUpdates.hunger !== undefined ? petUpdates.hunger : pet.hunger;
        if (effectiveHunger < 20) {
          if (!gameState.hungerLowSince) {
            stateUpdates.hungerLowSince = nowIso;
          }
        } else {
          if (gameState.hungerLowSince) {
            stateUpdates.hungerLowSince = null;
          }
        }

        // Night recovery
        if (isNight && gameState.lastNightRecovery !== today) {
          const houseBonus = getHouseBonus(gameState.activeHouse);
          if (houseBonus > 0) {
            const currentHealth = petUpdates.health !== undefined ? petUpdates.health : pet.health;
            petUpdates.health = Math.min(100, currentHealth + houseBonus);
          }
          stateUpdates.lastNightRecovery = today;
        }

        // Track consecutive days for weekly missions
        if (gameState.lastLoginDate !== today) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (gameState.lastLoginDate === yesterdayStr) {
            stateUpdates.consecutiveDays = gameState.consecutiveDays + 1;
          } else if (!gameState.lastLoginDate) {
            stateUpdates.consecutiveDays = 1;
          } else {
            stateUpdates.consecutiveDays = 1;
          }
          stateUpdates.lastLoginDate = today;
        }

        // Track weekly game data reset if new week
        if (gameState.currentWeekId !== currentWeekId) {
          stateUpdates.currentWeekId = currentWeekId;
          stateUpdates.weeklyGameData = JSON.stringify({
            weekId: currentWeekId, memoryPlays: 0, catchPlays: 0,
            memoryBestScore: 0, catchBestScore: 0,
          });
        }

        // Record app usage
        await storage.recordAppUsage(familyId, userId, today);

        // Apply updates
        const hasPetUpdates = Object.keys(petUpdates).length > 0;
        const hasStateUpdates = Object.keys(stateUpdates).length > 0;

        if (hasPetUpdates || hasStateUpdates) {
          const promises: Promise<any>[] = [];
          if (hasPetUpdates) {
            promises.push(storage.updatePet(pet.id, petUpdates));
            Object.assign(pet, petUpdates);
          }
          if (hasStateUpdates) {
            promises.push(storage.updateGameState(gameState.id, stateUpdates));
            Object.assign(gameState, stateUpdates);
          }
          await Promise.all(promises);
        }

        // Generate weekly missions if needed
        await generateWeeklyMissions(familyId, currentWeekId);

        // Check auto-complete missions
        const weeklyGameData = getWeeklyGameData(gameState, currentWeekId);
        const consecutiveDays = stateUpdates.consecutiveDays ?? gameState.consecutiveDays;
        await checkAndAutoCompleteMissions(familyId, currentWeekId, weeklyGameData, consecutiveDays);
      }

      const currentWeekId = getWeekId(new Date());
      const missionList = await storage.getMissionsByWeek(familyId, currentWeekId);
      const legacyMissions = await storage.getAllMissions(familyId);
      const parentMissions = legacyMissions.filter(m => !m.weekId && m.type === 'parent');

      res.json({
        pet,
        inventory,
        missions: [...missionList, ...parentMissions],
        gameState,
        achievements: achievementList,
        cosmetics: cosmeticsList,
        weekId: currentWeekId,
      });
    } catch (error) {
      console.error('Game data error:', error);
      res.status(500).json({ error: "Error al obtener datos del juego" });
    }
  });

  // Pet routes
  app.get("/api/pet", requireAuth, async (req, res) => {
    try {
      const pet = await storage.getPet(req.session.familyId!);
      if (!pet) return res.status(404).json({ error: "Mascota no encontrada" });
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener mascota" });
    }
  });

  app.post("/api/pet/configure", requireAuth, async (req, res) => {
    try {
      const familyId = req.session.familyId!;
      const { name, type } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 20) {
        return res.status(400).json({ error: "El nombre debe tener entre 1 y 20 caracteres" });
      }
      const validTypes = ['🐶', '🐱', '🐰', '🐹'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Tipo de mascota no válido" });
      }

      const pet = await storage.getPet(familyId);
      if (!pet) return res.status(404).json({ error: "Mascota no encontrada" });
      if (pet.configured) {
        return res.status(400).json({ error: "La mascota ya fue configurada" });
      }

      const updated = await storage.updatePet(pet.id, {
        name: name.trim(),
        type,
        configured: true,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error al configurar mascota" });
    }
  });

  app.patch("/api/pet/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const familyId = req.session.familyId!;
      const existingPet = await storage.getPet(familyId);
      if (!existingPet || existingPet.id !== id) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta mascota" });
      }
      const updates = { ...req.body };
      delete updates.name;
      delete updates.type;
      delete updates.configured;
      const pet = await storage.updatePet(id, updates);
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar mascota" });
    }
  });

  // Pet actions - use item from inventory
  app.post("/api/pet/:id/use-item", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { itemType } = req.body;
      const familyId = req.session.familyId!;

      const itemDef = CONSUMABLE_ITEMS[itemType];
      if (!itemDef) return res.status(400).json({ error: "Artículo no válido" });

      const [pet, inventory, gameState] = await Promise.all([
        storage.getPet(familyId),
        storage.getInventory(familyId),
        storage.getGameState(familyId),
      ]);

      if (!pet || !inventory || !gameState) return res.status(404).json({ error: "Datos no encontrados" });

      const currentCount = (inventory as any)[itemDef.inventoryField] as number;
      if (currentCount <= 0) return res.status(400).json({ error: "No tienes este artículo" });

      let statIncrease = itemDef.amount;
      if (itemDef.stat === 'hunger') {
        statIncrease += getBowlBonus(gameState.activeBowl);
      }

      const petUpdate: any = {};
      petUpdate[itemDef.stat] = Math.min(100, (pet as any)[itemDef.stat] + statIncrease);

      if (itemType === 'ball' || itemType === 'rope') {
        petUpdate.hunger = Math.max(0, pet.hunger - 5);
      }

      const invUpdate: any = {};
      invUpdate[itemDef.inventoryField] = currentCount - 1;

      const updatePromises: Promise<any>[] = [
        storage.updatePet(id, petUpdate),
        storage.updateInventory(inventory.id, invUpdate),
      ];

      const newHunger = petUpdate.hunger !== undefined ? petUpdate.hunger : pet.hunger;
      if (newHunger >= 20 && gameState.hungerLowSince) {
        updatePromises.push(storage.updateGameState(gameState.id, { hungerLowSince: null }));
      }

      const [updatedPet, updatedInventory] = await Promise.all(updatePromises);

      await checkPetAchievements(familyId, updatedPet);

      res.json({ pet: updatedPet, inventory: updatedInventory, playAnimation: itemType === 'ball' || itemType === 'rope' ? itemType : null });
    } catch (error) {
      res.status(500).json({ error: "Error al usar artículo" });
    }
  });

  // Legacy pet action routes (backward compat)
  app.post("/api/pet/:id/feed", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const familyId = req.session.familyId!;
      const [pet, inventory, gameState] = await Promise.all([
        storage.getPet(familyId),
        storage.getInventory(familyId),
        storage.getGameState(familyId),
      ]);

      if (!pet || !inventory || !gameState) return res.status(404).json({ error: "Datos no encontrados" });

      let foodField = 'basicFood';
      let foodCount = inventory.basicFood;
      if (foodCount <= 0) {
        foodField = 'snack';
        foodCount = inventory.snack;
      }
      if (foodCount <= 0 && inventory.food > 0) {
        foodField = 'food';
        foodCount = inventory.food;
      }
      if (foodCount <= 0) return res.status(400).json({ error: "No hay comida disponible" });

      const baseAmount = foodField === 'snack' ? 40 : 30;
      const bonus = getBowlBonus(gameState.activeBowl);

      const invUpdate: any = {};
      invUpdate[foodField] = foodCount - 1;

      const [updatedInventory, updatedPet] = await Promise.all([
        storage.updateInventory(inventory.id, invUpdate),
        storage.updatePet(id, { hunger: Math.min(100, pet.hunger + baseAmount + bonus) }),
      ]);

      await checkPetAchievements(familyId, updatedPet);
      res.json({ pet: updatedPet, inventory: updatedInventory });
    } catch (error) {
      res.status(500).json({ error: "Error al alimentar mascota" });
    }
  });

  app.post("/api/pet/:id/play", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const familyId = req.session.familyId!;
      const pet = await storage.getPet(familyId);
      const inventory = await storage.getInventory(familyId);

      if (!pet || !inventory) return res.status(404).json({ error: "Datos no encontrados" });

      let toyField = 'ball';
      let toyCount = inventory.ball;
      if (toyCount <= 0) {
        toyField = 'rope';
        toyCount = inventory.rope;
      }
      if (toyCount <= 0 && inventory.toys > 0) {
        toyField = 'toys';
        toyCount = inventory.toys;
      }
      if (toyCount <= 0) return res.status(400).json({ error: "No hay juguetes disponibles" });

      const invUpdate: any = {};
      invUpdate[toyField] = toyCount - 1;

      const [updatedInventory, updatedPet] = await Promise.all([
        storage.updateInventory(inventory.id, invUpdate),
        storage.updatePet(id, {
          happiness: Math.min(100, pet.happiness + 30),
          hunger: Math.max(0, pet.hunger - 5),
        }),
      ]);

      await checkPetAchievements(familyId, updatedPet);
      res.json({ pet: updatedPet, inventory: updatedInventory });
    } catch (error) {
      res.status(500).json({ error: "Error al jugar con mascota" });
    }
  });

  app.post("/api/pet/:id/heal", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const familyId = req.session.familyId!;
      const pet = await storage.getPet(familyId);
      const inventory = await storage.getInventory(familyId);

      if (!pet || !inventory) return res.status(404).json({ error: "Datos no encontrados" });
      if (inventory.medicine <= 0) return res.status(400).json({ error: "No hay medicina disponible" });

      const [updatedInventory, updatedPet] = await Promise.all([
        storage.updateInventory(inventory.id, { medicine: inventory.medicine - 1 }),
        storage.updatePet(id, { health: Math.min(100, pet.health + 30) }),
      ]);

      await checkPetAchievements(familyId, updatedPet);
      res.json({ pet: updatedPet, inventory: updatedInventory });
    } catch (error) {
      res.status(500).json({ error: "Error al curar mascota" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory = await storage.getInventory(req.session.familyId!);
      if (!inventory) return res.status(404).json({ error: "Inventario no encontrado" });
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener inventario" });
    }
  });

  // Shop - buy consumable items
  app.post("/api/shop/buy", requireAuth, async (req, res) => {
    try {
      const { item, quantity } = req.body;
      const qty = quantity || 1;
      const familyId = req.session.familyId!;

      const itemDef = CONSUMABLE_ITEMS[item];
      if (!itemDef) {
        return res.status(400).json({ error: "Artículo no válido" });
      }

      const totalCost = itemDef.price * qty;

      const [gameState, inventory] = await Promise.all([
        storage.getGameState(familyId),
        storage.getInventory(familyId),
      ]);

      if (!gameState || !inventory) return res.status(404).json({ error: "Estado del juego o inventario no encontrado" });
      if (gameState.points < totalCost) return res.status(400).json({ error: "No tienes suficientes monedas" });

      const currentCount = (inventory as any)[itemDef.inventoryField] as number;
      if (currentCount + qty > 10) return res.status(400).json({ error: `Máximo 10 unidades. Tienes ${currentCount}` });

      const invUpdate: any = {};
      invUpdate[itemDef.inventoryField] = currentCount + qty;

      const [updatedGameState, updatedInventory] = await Promise.all([
        storage.updateGameState(gameState.id, { points: gameState.points - totalCost }),
        storage.updateInventory(inventory.id, invUpdate),
      ]);

      res.json({ gameState: updatedGameState, inventory: updatedInventory });
    } catch (error) {
      res.status(500).json({ error: "Error al comprar artículo" });
    }
  });

  // Shop - buy permanent items
  app.post("/api/shop/buy-permanent", requireAuth, async (req, res) => {
    try {
      const { item } = req.body;
      const familyId = req.session.familyId!;

      const itemDef = PERMANENT_ITEMS[item];
      if (!itemDef) {
        return res.status(400).json({ error: "Artículo no válido" });
      }

      const gameState = await storage.getGameState(familyId);
      if (!gameState) return res.status(404).json({ error: "Estado del juego no encontrado" });

      const alreadyOwned = (gameState as any)[itemDef.stateField] as boolean;
      if (alreadyOwned) return res.status(400).json({ error: "Ya tienes este artículo" });

      if (gameState.points < itemDef.price) return res.status(400).json({ error: "No tienes suficientes monedas" });

      const updates: any = {
        points: gameState.points - itemDef.price,
        [itemDef.stateField]: true,
        [itemDef.activeField]: item,
      };

      const updatedGameState = await storage.updateGameState(gameState.id, updates);
      res.json({ gameState: updatedGameState });
    } catch (error) {
      res.status(500).json({ error: "Error al comprar artículo permanente" });
    }
  });

  // Cosmetics routes
  app.get("/api/cosmetics", requireAuth, async (req, res) => {
    try {
      const cosmetics = await storage.getOwnedCosmetics(req.session.familyId!);
      res.json(cosmetics);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener accesorios" });
    }
  });

  app.post("/api/cosmetics/buy", requireAuth, async (req, res) => {
    try {
      const { cosmeticId } = req.body;
      const familyId = req.session.familyId!;

      const item = getCosmeticById(cosmeticId);
      if (!item) return res.status(400).json({ error: "Accesorio no válido" });

      const alreadyOwned = await storage.isOwnedCosmetic(familyId, cosmeticId);
      if (alreadyOwned) return res.status(400).json({ error: "Ya tienes este accesorio" });

      const gameState = await storage.getGameState(familyId);
      if (!gameState) return res.status(404).json({ error: "Estado del juego no encontrado" });
      if (gameState.points < item.price) return res.status(400).json({ error: "No tienes suficientes monedas" });

      if (item.price > 0) {
        await storage.updateGameState(gameState.id, { points: gameState.points - item.price });
      }

      if (item.type === 'background') {
        const pet = await storage.getPet(familyId);
        if (pet) await storage.updatePet(pet.id, { habitatTheme: cosmeticId === 'bg_garden' ? null : cosmeticId });
      } else if (item.type === 'bodyColor') {
        const pet = await storage.getPet(familyId);
        if (pet) await storage.updatePet(pet.id, { bodyColor: cosmeticId === 'color_default' ? null : cosmeticId });
      }

      const cosmetic = await storage.addOwnedCosmetic({ familyId, cosmeticId, equipped: false });
      res.json({ cosmetic });
    } catch (error) {
      res.status(500).json({ error: "Error al comprar accesorio" });
    }
  });

  app.post("/api/cosmetics/:id/equip", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { equip } = req.body;
      const familyId = req.session.familyId!;

      const owned = await storage.getOwnedCosmetics(familyId);
      const cosmetic = owned.find(c => c.id === id);
      if (!cosmetic) return res.status(404).json({ error: "Accesorio no encontrado" });

      const item = getCosmeticById(cosmetic.cosmeticId);
      if (!item) return res.status(400).json({ error: "Accesorio no válido" });

      if (item.type === 'background') {
        const pet = await storage.getPet(familyId);
        if (pet) {
          await storage.updatePet(pet.id, { habitatTheme: equip ? (cosmetic.cosmeticId === 'bg_garden' ? null : cosmetic.cosmeticId) : null });
        }
      } else if (item.type === 'bodyColor') {
        const pet = await storage.getPet(familyId);
        if (pet) {
          await storage.updatePet(pet.id, { bodyColor: equip ? (cosmetic.cosmeticId === 'color_default' ? null : cosmetic.cosmeticId) : null });
        }
      }

      if (equip) {
        await storage.unequipCosmeticsByType(familyId, item.type);
      }

      const updated = await storage.updateCosmetic(id, { equipped: !!equip });
      res.json({ cosmetic: updated });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar accesorio" });
    }
  });

  // Mission routes
  app.get("/api/missions", requireAuth, async (req, res) => {
    try {
      const missionList = await storage.getAllMissions(req.session.familyId!);
      res.json(missionList);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener misiones" });
    }
  });

  app.post("/api/missions", requireParent, async (req, res) => {
    try {
      const familyId = req.session.familyId!;
      const currentWeekId = getWeekId(new Date());

      const weekMissions = await storage.getMissionsByWeek(familyId, currentWeekId);
      const parentMissionsThisWeek = weekMissions.filter(m => m.type === 'parent');

      if (parentMissionsThisWeek.length >= 4) {
        return res.status(400).json({ error: "Ya alcanzaste el límite semanal de misiones (4 máximo)" });
      }

      const { title, description, icon, points, statBonus } = req.body;

      if (!title || !points) {
        return res.status(400).json({ error: "Título y puntos son obligatorios" });
      }

      const rewardPoints = parseInt(points, 10);
      if (![10, 20, 30, 40, 50].includes(rewardPoints)) {
        return res.status(400).json({ error: "La recompensa debe ser 10, 20, 30, 40 o 50 monedas" });
      }

      const mission = await storage.createMission({
        familyId,
        title,
        description: description || null,
        icon: icon || 'star',
        duration: 'Semanal',
        points: rewardPoints,
        type: 'parent',
        weekId: currentWeekId,
        statBonus: statBonus || null,
        statAmount: statBonus ? 5 : 0,
        completed: false,
        approved: false,
        progress: 0,
        progressTarget: 1,
      });
      res.json(mission);
    } catch (error) {
      console.error('Create mission error:', error);
      res.status(500).json({ error: "Error al crear misión" });
    }
  });

  app.patch("/api/missions/:id", requireParent, async (req, res) => {
    try {
      const { id } = req.params;
      const mission = await storage.updateMission(id, req.body);
      res.json(mission);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar misión" });
    }
  });

  app.post("/api/missions/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const familyId = req.session.familyId!;

      const mission = await storage.getMission(id);
      if (!mission) return res.status(404).json({ error: "Misión no encontrada" });

      if (mission.type !== 'parent') {
        return res.status(400).json({ error: "Solo las misiones de padres se marcan manualmente" });
      }

      const updatedMission = await storage.updateMission(id, { completed: true });

      const allMissions = await storage.getAllMissions(familyId);
      const completedCount = allMissions.filter(m => m.completed || m.approved).length;
      await checkMissionAchievements(familyId, completedCount);

      res.json(updatedMission);
    } catch (error) {
      res.status(500).json({ error: "Error al completar misión" });
    }
  });

  app.post("/api/missions/:id/approve", requireParent, async (req, res) => {
    try {
      const { id } = req.params;
      const { approve } = req.body;
      const familyId = req.session.familyId!;

      const mission = await storage.getMission(id);
      if (!mission) return res.status(404).json({ error: "Misión no encontrada" });

      const gameState = await storage.getGameState(familyId);
      if (!gameState) return res.status(404).json({ error: "Estado del juego no encontrado" });

      let updatedGameState = gameState;
      if (approve) {
        updatedGameState = await storage.updateGameState(gameState.id, {
          points: gameState.points + mission.points,
        });
        await checkPointsAchievements(familyId, updatedGameState.points);

        if (mission.statBonus && mission.statAmount > 0) {
          const pet = await storage.getPet(familyId);
          if (pet) {
            const statKey = mission.statBonus as 'hunger' | 'happiness' | 'health';
            const petUpdate: any = {};
            petUpdate[statKey] = Math.min(100, (pet as any)[statKey] + mission.statAmount);
            await storage.updatePet(pet.id, petUpdate);
          }
        }

        const weekId = mission.weekId || getWeekId(new Date());
        await storage.createMissionLog({
          familyId,
          missionTitle: mission.title,
          missionType: mission.type,
          reward: mission.points,
          weekId,
        });
      }

      const updatedMission = await storage.updateMission(id, {
        approved: approve,
        completed: false,
        completedAt: approve ? new Date().toISOString() : null,
      });

      res.json({ mission: updatedMission, gameState: updatedGameState });
    } catch (error) {
      res.status(500).json({ error: "Error al aprobar misión" });
    }
  });

  app.delete("/api/missions/:id", requireParent, async (req, res) => {
    try {
      const { id } = req.params;
      const mission = await storage.getMission(id);
      if (!mission) return res.status(404).json({ error: "Misión no encontrada" });

      if (mission.type !== 'parent') {
        return res.status(400).json({ error: "No se pueden eliminar misiones del sistema" });
      }

      await storage.deleteMission(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar misión" });
    }
  });

  // Game state routes
  app.get("/api/game-state", requireAuth, async (req, res) => {
    try {
      const gameState = await storage.getGameState(req.session.familyId!);
      if (!gameState) return res.status(404).json({ error: "Estado del juego no encontrado" });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener estado del juego" });
    }
  });

  app.patch("/api/game-state/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const gameState = await storage.updateGameState(id, req.body);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar estado del juego" });
    }
  });

  // Submit game score
  app.post("/api/games/submit-score", requireAuth, async (req, res) => {
    try {
      const { score, gameType } = req.body;
      const familyId = req.session.familyId!;

      const [gameState, pet] = await Promise.all([
        storage.getGameState(familyId),
        storage.getPet(familyId),
      ]);

      if (!gameState || !pet) return res.status(404).json({ error: "Estado del juego o mascota no encontrado" });

      let pointsToAdd = 1;
      let happinessIncrease = 0;

      if (gameType === 'memory') {
        happinessIncrease = 15;
      } else if (gameType === 'catch') {
        happinessIncrease = 10;
      }

      const currentWeekId = getWeekId(new Date());
      const weeklyData = getWeeklyGameData(gameState, currentWeekId);

      if (gameType === 'memory') {
        weeklyData.memoryPlays++;
        weeklyData.memoryBestScore = Math.max(weeklyData.memoryBestScore, score);
      } else if (gameType === 'catch') {
        weeklyData.catchPlays++;
        weeklyData.catchBestScore = Math.max(weeklyData.catchBestScore, score);
      }

      const [updatedGameState, updatedPet] = await Promise.all([
        storage.updateGameState(gameState.id, {
          points: gameState.points + pointsToAdd,
          weeklyGameData: JSON.stringify(weeklyData),
          currentWeekId,
        }),
        storage.updatePet(pet.id, { happiness: Math.min(100, pet.happiness + happinessIncrease) }),
      ]);

      const newAchievements: string[] = [];
      if (gameType === 'memory') {
        const earned = await awardAchievementIfNew(familyId, 'memory_win');
        if (earned) newAchievements.push('memory_win');
      }
      if (gameType === 'catch' && score >= 10) {
        const earned = await awardAchievementIfNew(familyId, 'catch_star');
        if (earned) newAchievements.push('catch_star');
      }

      await checkPointsAchievements(familyId, updatedGameState.points);
      await checkPetAchievements(familyId, updatedPet);

      await checkAndAutoCompleteMissions(familyId, currentWeekId, weeklyData, gameState.consecutiveDays);

      res.json({
        gameState: updatedGameState,
        pet: updatedPet,
        pointsEarned: pointsToAdd,
        newAchievements,
      });
    } catch (error) {
      res.status(500).json({ error: "Error al enviar puntuación" });
    }
  });

  // Achievements route
  app.get("/api/achievements", requireAuth, async (req, res) => {
    try {
      const achievementList = await storage.getAchievements(req.session.familyId!);
      res.json(achievementList);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener logros" });
    }
  });

  // Research data export (CSV)
  app.get("/api/research/export", requireParent, async (req, res) => {
    try {
      const familyId = req.session.familyId!;
      const [missionLogsList, appUsageList] = await Promise.all([
        storage.getMissionLogs(familyId),
        storage.getAppUsage(familyId),
      ]);

      let csv = "Tipo,Dato\n";
      csv += "\nMISIONES COMPLETADAS\n";
      csv += "Título,Tipo,Recompensa,Semana,Fecha Completada\n";
      for (const log of missionLogsList) {
        const dateStr = log.completedAt ? new Date(log.completedAt).toLocaleString('es-MX') : '';
        csv += `"${log.missionTitle}","${log.missionType}",${log.reward},"${log.weekId}","${dateStr}"\n`;
      }

      csv += "\nUSO DE LA APP\n";
      csv += "Usuario,Fecha\n";
      for (const usage of appUsageList) {
        csv += `"${usage.userId}","${usage.date}"\n`;
      }

      const weeklyMissions = await storage.getMissionsByWeek(familyId, getWeekId(new Date()));
      const parentCount = weeklyMissions.filter(m => m.type === 'parent').length;
      const completedCount = weeklyMissions.filter(m => m.completed || m.approved).length;

      csv += "\nRESUMEN SEMANAL\n";
      csv += `Misiones de padres creadas,${parentCount}\n`;
      csv += `Misiones completadas esta semana,${completedCount}\n`;
      csv += `Total misiones esta semana,${weeklyMissions.length}\n`;

      const gameState = await storage.getGameState(familyId);
      if (gameState) {
        csv += `Días consecutivos,${gameState.consecutiveDays}\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=datos_investigacion.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Error al exportar datos" });
    }
  });

  // ─── Sincronización de cola offline ────────────────────────────────────────
  app.post("/api/sync/offline-queue", requireAuth, async (req, res) => {
    const familyId = req.session.familyId!;
    const { actions } = req.body as {
      actions: Array<{
        id: string;
        type: string;
        payload: Record<string, unknown>;
        timestamp: string;
      }>;
    };

    if (!Array.isArray(actions) || actions.length === 0) {
      return res.json({ synced: 0 });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const action of actions) {
      try {
        if (action.type === "use-item") {
          const { petId, itemType } = action.payload as {
            petId: string;
            itemType: string;
          };
          const pet = await storage.getPet(familyId);
          const inventory = await storage.getInventory(familyId);
          const gameState = await storage.getGameState(familyId);
          if (!pet || !inventory || !gameState) continue;

          const item = {
            basicFood: { stat: "hunger" as const, amount: 30, field: "basicFood" },
            snack:     { stat: "hunger" as const, amount: 60, field: "snack" },
            ball:      { stat: "happiness" as const, amount: 30, field: "ball" },
            rope:      { stat: "happiness" as const, amount: 60, field: "rope" },
            medicine:  { stat: "health" as const, amount: 30, field: "medicine" },
          }[itemType];

          if (!item) continue;
          const inventoryField = item.field as keyof typeof inventory;
          if ((inventory[inventoryField] as number) <= 0) continue;

          const newVal = Math.min(100, (pet[item.stat] as number) + item.amount);
          await storage.updatePet(pet.id, { [item.stat]: newVal });
          await storage.updateInventory(inventory.id, {
            [inventoryField]: (inventory[inventoryField] as number) - 1,
          });
          synced++;

        } else if (action.type === "complete-mission") {
          const { missionId } = action.payload as { missionId: string };
          const mission = await storage.getMission(missionId);
          if (!mission || mission.familyId !== familyId) continue;
          if (mission.completed) continue;
          await storage.updateMission(missionId, {
            completed: true,
            completedAt: action.timestamp,
          });
          synced++;

        } else if (action.type === "submit-score") {
          // Los scores de minijuegos solo se usan para logros — registrar en gameState
          const { gameType, score } = action.payload as {
            gameType: string;
            score: number;
          };
          const weekId = getWeekId(new Date(action.timestamp));
          const gameState = await storage.getGameState(familyId);
          if (!gameState) continue;

          const weeklyData = getWeeklyGameData(gameState, weekId);
          if (gameType === "memory") {
            weeklyData.memoryPlays++;
            weeklyData.memoryBestScore = Math.max(weeklyData.memoryBestScore, score);
          } else if (gameType === "catch") {
            weeklyData.catchPlays++;
            weeklyData.catchBestScore = Math.max(weeklyData.catchBestScore, score);
          }
          await storage.updateGameState(gameState.id, {
            weeklyGameData: JSON.stringify(weeklyData),
          });
          synced++;
        }
      } catch (err) {
        errors.push(`${action.type}@${action.timestamp}: ${String(err)}`);
      }
    }

    res.json({ synced, total: actions.length, errors });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Achievement helpers
async function awardAchievementIfNew(familyId: string, type: string): Promise<boolean> {
  const existing = await storage.getAchievements(familyId);
  if (existing.some(a => a.type === type)) return false;
  await storage.createAchievement({ familyId, type });
  return true;
}

async function checkMissionAchievements(familyId: string, completedCount: number) {
  if (completedCount >= 1) await awardAchievementIfNew(familyId, 'first_mission');
  if (completedCount >= 5) await awardAchievementIfNew(familyId, 'five_missions');
  if (completedCount >= 10) await awardAchievementIfNew(familyId, 'ten_missions');
}

async function checkPointsAchievements(familyId: string, points: number) {
  if (points >= 100) await awardAchievementIfNew(familyId, 'points_100');
  if (points >= 500) await awardAchievementIfNew(familyId, 'points_500');
}

async function checkPetAchievements(familyId: string, pet: { happiness: number; health: number }) {
  if (pet.happiness >= 90) await awardAchievementIfNew(familyId, 'pet_happy');
  if (pet.health >= 90) await awardAchievementIfNew(familyId, 'healthy_pet');
}
