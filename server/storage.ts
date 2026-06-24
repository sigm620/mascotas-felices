import {
  type Pet,
  type InsertPet,
  type Inventory,
  type InsertInventory,
  type Mission,
  type InsertMission,
  type GameState,
  type InsertGameState,
  type User,
  type InsertUser,
  type Achievement,
  type InsertAchievement,
  type PetCosmetic,
  type InsertPetCosmetic,
  type MissionLog,
  type InsertMissionLog,
  type AppUsage,
  type InsertAppUsage,
  pets,
  inventories,
  missions,
  gameStates,
  users,
  achievements,
  petCosmetics,
  missionLogs,
  appUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getParentByFamilyId(familyId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPet(familyId: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, updates: Partial<Pet>): Promise<Pet>;

  getInventory(familyId: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory>;

  getAllMissions(familyId: string): Promise<Mission[]>;
  getMissionsByWeek(familyId: string, weekId: string): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMission(id: string, updates: Partial<Mission>): Promise<Mission>;
  deleteMission(id: string): Promise<void>;
  deleteOldWeekMissions(familyId: string, currentWeekId: string): Promise<void>;

  getGameState(familyId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: string, updates: Partial<GameState>): Promise<GameState>;

  getAchievements(familyId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  getOwnedCosmetics(familyId: string): Promise<PetCosmetic[]>;
  addOwnedCosmetic(cosmetic: InsertPetCosmetic): Promise<PetCosmetic>;
  updateCosmetic(id: string, updates: Partial<PetCosmetic>): Promise<PetCosmetic>;
  isOwnedCosmetic(familyId: string, cosmeticId: string): Promise<boolean>;
  unequipCosmeticsByType(familyId: string, cosmeticType: string): Promise<void>;

  createMissionLog(log: InsertMissionLog): Promise<MissionLog>;
  getMissionLogs(familyId: string): Promise<MissionLog[]>;
  getAllMissionLogs(): Promise<MissionLog[]>;

  recordAppUsage(familyId: string, userId: string, date: string): Promise<void>;
  getAppUsage(familyId: string): Promise<AppUsage[]>;
  getAllAppUsage(): Promise<AppUsage[]>;
  hasAppUsage(familyId: string, userId: string, date: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getParentByFamilyId(familyId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(and(eq(users.familyId, familyId), eq(users.role, 'parent')));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getPet(familyId: string): Promise<Pet | undefined> {
    const result = await db.select().from(pets).where(eq(pets.familyId, familyId));
    return result[0];
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const result = await db.insert(pets).values(insertPet).returning();
    return result[0];
  }

  async updatePet(id: string, updates: Partial<Pet>): Promise<Pet> {
    const result = await db.update(pets).set(updates).where(eq(pets.id, id)).returning();
    if (!result[0]) throw new Error('Pet not found');
    return result[0];
  }

  async getInventory(familyId: string): Promise<Inventory | undefined> {
    const result = await db.select().from(inventories).where(eq(inventories.familyId, familyId));
    return result[0];
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventories).values(insertInventory).returning();
    return result[0];
  }

  async updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory> {
    const result = await db.update(inventories).set(updates).where(eq(inventories.id, id)).returning();
    if (!result[0]) throw new Error('Inventory not found');
    return result[0];
  }

  async getAllMissions(familyId: string): Promise<Mission[]> {
    return db.select().from(missions).where(eq(missions.familyId, familyId));
  }

  async getMissionsByWeek(familyId: string, weekId: string): Promise<Mission[]> {
    return db.select().from(missions).where(
      and(eq(missions.familyId, familyId), eq(missions.weekId, weekId))
    );
  }

  async getMission(id: string): Promise<Mission | undefined> {
    const result = await db.select().from(missions).where(eq(missions.id, id));
    return result[0];
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const result = await db.insert(missions).values(insertMission).returning();
    return result[0];
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const result = await db.update(missions).set(updates).where(eq(missions.id, id)).returning();
    if (!result[0]) throw new Error('Mission not found');
    return result[0];
  }

  async deleteMission(id: string): Promise<void> {
    await db.delete(missions).where(eq(missions.id, id));
  }

  async deleteOldWeekMissions(familyId: string, currentWeekId: string): Promise<void> {
    const allMissions = await this.getAllMissions(familyId);
    for (const m of allMissions) {
      if (m.weekId && m.weekId !== currentWeekId) {
        await db.delete(missions).where(eq(missions.id, m.id));
      }
      if (!m.weekId && (m.type === 'system' || m.type === 'minigame')) {
        await db.delete(missions).where(eq(missions.id, m.id));
      }
    }
  }

  async getGameState(familyId: string): Promise<GameState | undefined> {
    const result = await db.select().from(gameStates).where(eq(gameStates.familyId, familyId));
    return result[0];
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const result = await db.insert(gameStates).values(insertGameState).returning();
    return result[0];
  }

  async updateGameState(id: string, updates: Partial<GameState>): Promise<GameState> {
    const result = await db.update(gameStates).set(updates).where(eq(gameStates.id, id)).returning();
    if (!result[0]) throw new Error('Game state not found');
    return result[0];
  }

  async getAchievements(familyId: string): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.familyId, familyId));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const result = await db.insert(achievements).values(insertAchievement).returning();
    return result[0];
  }

  async getOwnedCosmetics(familyId: string): Promise<PetCosmetic[]> {
    return db.select().from(petCosmetics).where(eq(petCosmetics.familyId, familyId));
  }

  async addOwnedCosmetic(cosmetic: InsertPetCosmetic): Promise<PetCosmetic> {
    const result = await db.insert(petCosmetics).values(cosmetic).returning();
    return result[0];
  }

  async updateCosmetic(id: string, updates: Partial<PetCosmetic>): Promise<PetCosmetic> {
    const result = await db.update(petCosmetics).set(updates).where(eq(petCosmetics.id, id)).returning();
    if (!result[0]) throw new Error('Cosmetic not found');
    return result[0];
  }

  async isOwnedCosmetic(familyId: string, cosmeticId: string): Promise<boolean> {
    const result = await db.select().from(petCosmetics).where(
      and(eq(petCosmetics.familyId, familyId), eq(petCosmetics.cosmeticId, cosmeticId))
    );
    return result.length > 0;
  }

  async unequipCosmeticsByType(familyId: string, cosmeticType: string): Promise<void> {
    const owned = await this.getOwnedCosmetics(familyId);
    const { getCosmeticById } = await import("@shared/cosmetics");
    for (const c of owned) {
      const item = getCosmeticById(c.cosmeticId);
      if (item && item.type === cosmeticType && c.equipped) {
        await db.update(petCosmetics).set({ equipped: false }).where(eq(petCosmetics.id, c.id));
      }
    }
  }

  async createMissionLog(log: InsertMissionLog): Promise<MissionLog> {
    const result = await db.insert(missionLogs).values(log).returning();
    return result[0];
  }

  async getMissionLogs(familyId: string): Promise<MissionLog[]> {
    return db.select().from(missionLogs).where(eq(missionLogs.familyId, familyId));
  }

  async getAllMissionLogs(): Promise<MissionLog[]> {
    return db.select().from(missionLogs);
  }

  async recordAppUsage(familyId: string, userId: string, date: string): Promise<void> {
    const exists = await this.hasAppUsage(familyId, userId, date);
    if (!exists) {
      await db.insert(appUsage).values({ familyId, userId, date });
    }
  }

  async getAppUsage(familyId: string): Promise<AppUsage[]> {
    return db.select().from(appUsage).where(eq(appUsage.familyId, familyId));
  }

  async getAllAppUsage(): Promise<AppUsage[]> {
    return db.select().from(appUsage);
  }

  async hasAppUsage(familyId: string, userId: string, date: string): Promise<boolean> {
    const result = await db.select().from(appUsage).where(
      and(eq(appUsage.familyId, familyId), eq(appUsage.userId, userId), eq(appUsage.date, date))
    );
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
