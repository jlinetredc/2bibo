import { afterEach, describe, expect, it } from "vitest";
import { addProfile, editProfile, emptyProfiles, isProfilesState, loadProfiles, saveProfiles, selectProfile, type ProfileInput } from "./profiles";

const input: ProfileInput = { nickname: "Mít", ageBand: "3-4", avatar: "bunny" };
afterEach(() => localStorage.clear());

describe("local child profiles", () => {
  it("creates separate identities, trims nicknames and selects the new profile", () => {
    const first = addProfile(emptyProfiles(), { ...input, nickname: " Mít " }, "first");
    const second = addProfile(first, input, "second");
    expect(second.profiles.map((p) => p.nickname)).toEqual(["Mít", "Mít"]);
    expect(second.activeId).toBe("second");
    expect(first.profiles).toHaveLength(1);
    expect(() => addProfile(second, input, "first")).toThrow();
  });
  it("edits and selects independently without changing another child's data", () => {
    const state = addProfile(addProfile(emptyProfiles(), input, "a"), { ...input, nickname: "Bông" }, "b");
    const selected = selectProfile(state, "a");
    const edited = editProfile(selected, "a", { nickname: "Mít nhỏ", ageBand: "5-6", avatar: "cat" });
    expect(edited.activeId).toBe("a");
    expect(edited.profiles[1]).toBe(state.profiles[1]);
    expect(state.profiles[0].nickname).toBe("Mít");
    expect(() => selectProfile(state, "missing")).toThrow();
    expect(() => editProfile(state, "missing", input)).toThrow();
  });
  it.each(["", "   ", "x".repeat(25)])("rejects invalid nickname %j", (nickname) => {
    expect(() => addProfile(emptyProfiles(), { ...input, nickname })).toThrow();
  });
  it("rejects stale selection, duplicate IDs, unknown options and private fields", () => {
    const state = addProfile(emptyProfiles(), input, "a");
    expect(isProfilesState(state)).toBe(true);
    expect(isProfilesState({ ...state, activeId: "missing" })).toBe(false);
    expect(isProfilesState({ ...state, profiles: [...state.profiles, ...state.profiles] })).toBe(false);
    for (const extra of [{ ageBand: "8" }, { avatar: "unknown" }, { email: "private" }]) {
      expect(isProfilesState({ ...state, profiles: [{ ...state.profiles[0], ...extra }] })).toBe(false);
    }
  });
  it("restores multiple profiles and the selected identity through shared persistence", async () => {
    expect(await loadProfiles()).toEqual(emptyProfiles());
    const state = selectProfile(addProfile(addProfile(emptyProfiles(), input, "a"), input, "b"), "a");
    await saveProfiles(state);
    expect(await loadProfiles()).toEqual(state);
  });
});
