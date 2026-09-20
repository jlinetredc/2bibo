"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { addProfile, ageBands, avatars, editProfile, loadProfiles, saveProfiles, selectProfile, type ChildProfile, type ProfileInput, type ProfilesState } from "@/game-core/profiles/profiles";
import styles from "./ProfilePicker.module.css";

export function ProfilePicker() {
  const [state, setState] = useState<ProfilesState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [editing, setEditing] = useState<ChildProfile | null | undefined>(undefined);
  const [nickname, setNickname] = useState("");
  const [ageBand, setAgeBand] = useState<ProfileInput["ageBand"]>("3-4");
  const [avatar, setAvatar] = useState<ProfileInput["avatar"]>("bunny");
  const nameInput = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    let mounted = true;
    void loadProfiles().then((value) => { if (mounted) setState(value); }, () => { if (mounted) setLoadError(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => { if (editing !== undefined) nameInput.current?.focus(); }, [editing]);
  useEffect(() => {
    if (editing === undefined && !busy && restoreFocus.current) {
      addButton.current?.focus(); restoreFocus.current = false;
    }
  }, [editing, busy]);

  function open(profile: ChildProfile | null) {
    setNickname(profile?.nickname ?? ""); setAgeBand(profile?.ageBand ?? "3-4"); setAvatar(profile?.avatar ?? "bunny");
    setError(""); setEditing(profile);
  }
  async function commit(next: ProfilesState, closeForm = false) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      await saveProfiles(next);
      setState(next);
      if (closeForm) { restoreFocus.current = true; setEditing(undefined); }
    } catch { setError("Chưa lưu được trên thiết bị. Thông tin con nhập vẫn ở đây; hãy thử lưu lại."); }
    finally { saving.current = false; setBusy(false); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!state || saving.current) return;
    try {
      const input = { nickname, ageBand, avatar };
      void commit(editing ? editProfile(state, editing.id, input) : addProfile(state, input), true);
    } catch (cause) { setError((cause as Error).message); }
  }
  const active = state?.profiles.find((profile) => profile.id === state.activeId);

  return <main className={styles.page}>
    <Link className={styles.back} href="/">← Bibo Play</Link>
    <header><p className={styles.eyebrow}>BIBO PLAY</p><h1>Hôm nay ai chơi?</h1><p>Chọn hình của con nhé.</p></header>
    {loadError ? <div role="alert"><p>Chưa đọc được hồ sơ trên thiết bị. Hồ sơ đã lưu được giữ nguyên.</p>
      <button className={styles.button} onClick={() => window.location.reload()}>Tải lại</button></div>
      : !state ? <p role="status">Đang mở hồ sơ…</p> : <>
        {state.profiles.length === 0 && <p>Thêm một người bạn để bắt đầu.</p>}
        <ul className={styles.grid} aria-label="Hồ sơ trên thiết bị">
          {state.profiles.map((profile) => <li key={profile.id} className={styles.card}>
            <button className={styles.choose} disabled={busy || editing !== undefined} aria-label={`Chọn ${profile.nickname}`}
              aria-pressed={state.activeId === profile.id} onClick={() => { void commit(selectProfile(state, profile.id)); }}>
              <span className={styles.avatar} aria-hidden="true">{avatars.find((item) => item.id === profile.avatar)!.icon}</span>
              <strong>{profile.nickname}</strong><span>{state.activeId === profile.id ? "✓ Đang chọn" : "Chọn bạn này"}</span>
            </button>
            <button className={styles.edit} disabled={busy} aria-label={`Sửa hồ sơ ${profile.nickname}`} onClick={() => open(profile)}>Sửa</button>
          </li>)}
        </ul>
        <p className={styles.greeting} role="status">{active ? `Chào ${active.nickname}!` : ""}</p>
        <button ref={addButton} className={styles.button} disabled={busy} onClick={() => open(null)}>＋ Thêm bạn</button>
        {editing !== undefined && <form className={styles.form} onSubmit={submit} aria-label={editing ? "Sửa hồ sơ" : "Thêm hồ sơ"}>
          <h2>{editing ? "Sửa hồ sơ" : "Một người bạn mới"}</h2>
          <label htmlFor="nickname">Biệt danh</label>
          <input ref={nameInput} id="nickname" value={nickname} maxLength={24} required autoComplete="off" disabled={busy}
            onChange={(event) => setNickname(event.target.value)} aria-describedby="nickname-help" />
          <p id="nickname-help">Chỉ cần biệt danh, không cần tên thật.</p>
          <label htmlFor="age-band">Nhóm tuổi</label>
          <select id="age-band" value={ageBand} disabled={busy} onChange={(event) => setAgeBand(event.target.value as ProfileInput["ageBand"])}>
            {ageBands.map((band) => <option key={band} value={band}>{band.replace("-", "–")} tuổi</option>)}
          </select>
          <fieldset disabled={busy}><legend>Hình đại diện</legend><div className={styles.avatars}>
            {avatars.map((item) => <label key={item.id} className={styles.avatarOption}>
              <input type="radio" name="avatar" value={item.id} checked={avatar === item.id} onChange={() => setAvatar(item.id)} />
              <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </label>)}
          </div></fieldset>
          <div className={styles.actions}><button className={styles.button} disabled={busy} type="submit">{busy ? "Đang lưu…" : "Lưu hồ sơ"}</button>
            <button className={styles.button} type="button" disabled={busy} onClick={() => { setEditing(undefined); setError(""); addButton.current?.focus(); }}>Hủy</button></div>
        </form>}
      </>}
    {error && <p role="alert">{error}</p>}
    {!busy && editing === undefined && <Link className={styles.back} href="/play">Vào góc chơi →</Link>}
    <p className={styles.privacy}>Hồ sơ chỉ lưu trên thiết bị này. Không cần tài khoản.</p>
  </main>;
}
