import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("child"),
  familyId: varchar("family_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  hunger: real("hunger").notNull().default(70),
  happiness: real("happiness").notNull().default(60),
  health: real("health").notNull().default(80),
  level: integer("level").notNull().default(1),
  bodyColor: text("body_color"),
  habitatTheme: text("habitat_theme"),
  configured: boolean("configured").notNull().default(false),
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
});

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export const petCosmetics = pgTable("pet_cosmetics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  cosmeticId: text("cosmetic_id").notNull(),
  equipped: boolean("equipped").notNull().default(false),
});

export const insertPetCosmeticSchema = createInsertSchema(petCosmetics).omit({
  id: true,
});

export type InsertPetCosmetic = z.infer<typeof insertPetCosmeticSchema>;
export type PetCosmetic = typeof petCosmetics.$inferSelect;

export const inventories = pgTable("inventories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  food: integer("food").notNull().default(3),
  toys: integer("toys").notNull().default(2),
  medicine: integer("medicine").notNull().default(1),
  basicFood: integer("basic_food").notNull().default(0),
  snack: integer("snack").notNull().default(0),
  ball: integer("ball").notNull().default(0),
  rope: integer("rope").notNull().default(0),
});

export const insertInventorySchema = createInsertSchema(inventories).omit({
  id: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventories.$inferSelect;

export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration").notNull(),
  points: integer("points").notNull(),
  completed: boolean("completed").notNull().default(false),
  approved: boolean("approved").notNull().default(false),
  type: text("type").notNull().default("parent"),
  icon: text("icon"),
  weekId: text("week_id"),
  statBonus: text("stat_bonus"),
  statAmount: integer("stat_amount").notNull().default(0),
  completedAt: text("completed_at"),
  autoDetect: text("auto_detect"),
  progress: integer("progress").notNull().default(0),
  progressTarget: integer("progress_target").notNull().default(1),
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
});

export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missions.$inferSelect;

export const missionLogs = pgTable("mission_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  missionTitle: text("mission_title").notNull(),
  missionType: text("mission_type").notNull(),
  reward: integer("reward").notNull(),
  weekId: text("week_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertMissionLogSchema = createInsertSchema(missionLogs).omit({
  id: true,
  completedAt: true,
});

export type InsertMissionLog = z.infer<typeof insertMissionLogSchema>;
export type MissionLog = typeof missionLogs.$inferSelect;

export const appUsage = pgTable("app_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
});

export const insertAppUsageSchema = createInsertSchema(appUsage).omit({
  id: true,
});

export type InsertAppUsage = z.infer<typeof insertAppUsageSchema>;
export type AppUsage = typeof appUsage.$inferSelect;

export const gameStates = pgTable("game_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  points: integer("points").notNull().default(150),
  activeBowl: text("active_bowl"),
  activeHouse: text("active_house"),
  ownedBowlBasic: boolean("owned_bowl_basic").notNull().default(false),
  ownedBowlSpecial: boolean("owned_bowl_special").notNull().default(false),
  ownedHouseBasic: boolean("owned_house_basic").notNull().default(false),
  ownedHouseFancy: boolean("owned_house_fancy").notNull().default(false),
  lastNightRecovery: text("last_night_recovery"),
  hungerLowSince: text("hunger_low_since"),
  lastDecayAt: text("last_decay_at"),
  consecutiveDays: integer("consecutive_days").notNull().default(0),
  lastLoginDate: text("last_login_date"),
  currentWeekId: text("current_week_id"),
  weeklyGameData: text("weekly_game_data"),
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
});

export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").notNull(),
  type: text("type").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export interface WeeklyGameData {
  weekId: string;
  memoryPlays: number;
  catchPlays: number;
  memoryBestScore: number;
  catchBestScore: number;
}
