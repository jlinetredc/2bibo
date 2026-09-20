import { createLocalStorageStore } from "../persistence/localStorage";
import { createVersionedStore } from "../persistence/store";

export const ageBands = ["3-4", "5-6", "7+"] as const;
export const avatars = [
  { id: "bunny", label: "Thỏ", icon: "🐰" },
  { id: "cat", label: "Mèo", icon: "🐱" },
  { id: "bear", label: "Gấu", icon: "🐻" },
  { id: "fox", label: "Cáo", icon: "🦊" },
] as const;
export interface ProfileInput {
  nickname: string;
  ageBand: typeof ageBands[number];
  avatar: typeof avatars[number]["id"];
}
export interface ChildProfile extends ProfileInput { id: string }
export interface ProfilesState { profiles: ChildProfile[]; activeId: string | null }
export const emptyProfiles = (): ProfilesState => ({ profiles: [], activeId: null });

function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function validInput(value: Record<string, unknown>) {
  return typeof value.nickname === "string" && value.nickname === value.nickname.trim()
    && value.nickname.length > 0 && value.nickname.length <= 24
    && ageBands.some((band) => band === value.ageBand) && avatars.some((avatar) => avatar.id === value.avatar);
}
export function isProfilesState(value: unknown): value is ProfilesState {
  if (!record(value) || Object.keys(value).some((key) => !["profiles", "activeId"].includes(key)) || !Array.isArray(value.profiles)) return false;
  const ids = new Set<string>();
  for (const profile of value.profiles) {
    if (!record(profile) || Object.keys(profile).some((key) => !["id", "nickname", "ageBand", "avatar"].includes(key))
      || !validInput(profile) || typeof profile.id !== "string" || !profile.id.trim() || ids.has(profile.id)) return false;
    ids.add(profile.id);
  }
  return value.activeId === null || (typeof value.activeId === "string" && ids.has(value.activeId));
}

function clean(input: ProfileInput): ProfileInput {
  const value = { nickname: input.nickname.trim(), ageBand: input.ageBand, avatar: input.avatar };
  if (!validInput(value)) throw new Error("Vui lòng nhập biệt danh từ 1 đến 24 ký tự và chọn nhóm tuổi, hình đại diện.");
  return value;
}
export function addProfile(state: ProfilesState, input: ProfileInput, id: string = crypto.randomUUID()): ProfilesState {
  if (!id.trim() || state.profiles.some((profile) => profile.id === id)) throw new Error("Profile ID must be unique.");
  return { profiles: [...state.profiles, { id, ...clean(input) }], activeId: id };
}
export function editProfile(state: ProfilesState, id: string, input: ProfileInput): ProfilesState {
  if (!state.profiles.some((profile) => profile.id === id)) throw new Error("Profile not found.");
  const fields = clean(input);
  return { ...state, profiles: state.profiles.map((profile) => profile.id === id ? { id, ...fields } : profile) };
}
export function selectProfile(state: ProfilesState, id: string): ProfilesState {
  if (!state.profiles.some((profile) => profile.id === id)) throw new Error("Profile not found.");
  return { ...state, activeId: id };
}

const store = createVersionedStore(createLocalStorageStore(), { version: 1, validate: isProfilesState });
export const loadProfiles = async () => (await store.get("profiles")) ?? emptyProfiles();
export const saveProfiles = (state: ProfilesState) => store.set("profiles", state);
