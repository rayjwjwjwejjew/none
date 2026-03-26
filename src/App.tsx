import { useCallback, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import "./index.css";
import {
  ALL_CONTENT_IMAGES,
  CHARACTER_COLORS,
  CHARACTER_SPRITES,
  DEFAULT_BG,
  SCRIPT,
  getSceneBg,
  getSceneCharacters,
  getSpecialBg,
} from "./engine";
import type { ScriptLine, StageCharacter } from "./engine";
import { AssetDB } from "./db";
import appSource from "./App.tsx?raw";
import mainSource from "./main.tsx?raw";
import engineSource from "./engine.ts?raw";
import scriptSource from "./script.ts?raw";
import dbSource from "./db.ts?raw";
import cssSource from "./index.css?raw";
import cnSource from "./utils/cn.ts?raw";
import indexHtmlSource from "../index.html?raw";
import packageJsonSource from "../package.json?raw";
import tsconfigSource from "../tsconfig.json?raw";
import viteConfigSource from "../vite.config.ts?raw";

const KEY_SETTINGS = "vn_settings_v1";
const KEY_MANIFEST = "vn_manifest_v1";
const KEY_SAVE = "vn_save_v1";

const DEFAULT_SETTINGS = {
  typeMs: 18,
  autoMs: 820,
  dim: 18,
  spriteW: 250,
  spriteOpacity: 100,
  bgScale: 104,
  bgOpacity: 100,
  spriteY: 0,
  spriteX: 0,
  bgmVol: 70,
  sfxVol: 70,
  uiSfxId: "",
  uiAlpha: 60,
};

type Settings = typeof DEFAULT_SETTINGS;
type GamePhase = "warning" | "title" | "playing" | "credits";
type LogItem = { who: string; text: string };
type Manifest = { bgm?: { id: string; label: string }[]; sfx?: { id: string; label: string }[] };

const PAUSE_CHARS: Record<string, number> = {
  "。": 6,
  "！": 5,
  "？": 5,
  "…": 4,
  "，": 2,
  "、": 2,
  "；": 3,
  "：": 3,
  ".": 4,
  "!": 4,
  "?": 4,
  ",": 2,
};

function readJson<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function RainCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const drops: { x: number; y: number; l: number; v: number; a: number }[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    for (let i = 0; i < 200; i += 1) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        l: 8 + Math.random() * 18,
        v: 6 + Math.random() * 10,
        a: 0.15 + Math.random() * 0.25,
      });
    }

    let frameId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(180, 210, 255, 0.32)";
      for (const drop of drops) {
        drop.y += drop.v;
        drop.x -= drop.v * 0.15;
        if (drop.y > height) {
          drop.y = -drop.l;
          drop.x = Math.random() * width;
        }
        if (drop.x < -20) {
          drop.x = width + 20;
        }
        ctx.globalAlpha = drop.a;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.v * 0.15, drop.y + drop.l);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    tick();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, [active]);

  if (!active) return null;
  return <canvas className="rain-canvas" ref={canvasRef} />;
}

function DustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const points: { x: number; y: number; r: number; a: number; vx: number; vy: number }[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    for (let i = 0; i < 90; i += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.8,
        a: 0.06 + Math.random() * 0.18,
        vx: -0.08 + Math.random() * 0.16,
        vy: -0.12 + Math.random() * 0.2,
      });
    }

    let frameId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const point of points) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${point.a})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    tick();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="dust" ref={canvasRef} />;
}

export function App() {
  const [index, setIndex] = useState(0);
  const [settings, setSettings] = useState<Settings>(() => readJson(KEY_SETTINGS, DEFAULT_SETTINGS));
  const [phase, setPhase] = useState<GamePhase>("warning");
  const [log, setLog] = useState<LogItem[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [auto, setAuto] = useState(false);
  const [skip, setSkip] = useState(false);
  const [bgUrl, setBgUrl] = useState(DEFAULT_BG);
  const [prevBgUrl, setPrevBgUrl] = useState("");
  const [currentAct, setCurrentAct] = useState("");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState("");
  const [codeTxtUrl, setCodeTxtUrl] = useState("");
  const [transitionActive, setTransitionActive] = useState(false);
  const [transitionType, setTransitionType] = useState("fade-black");
  const [effectActive, setEffectActive] = useState("");
  const [showRain, setShowRain] = useState(false);
  const [sceneBlur, setSceneBlur] = useState(false);
  const [stageChars, setStageChars] = useState<StageCharacter[]>([]);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [currentBgmId, setCurrentBgmId] = useState("");
  const [currentBgmName, setCurrentBgmName] = useState("");
  const [bgmList, setBgmList] = useState<{ id: string; label: string }[]>([]);
  const [sfxList, setSfxList] = useState<{ id: string; label: string }[]>([]);
  const [titleReady, setTitleReady] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [cgVisible, setCgVisible] = useState(false);
  const [cgTitle, setCgTitle] = useState("");
  const [cgImageUrl, setCgImageUrl] = useState("");

  const autoTimeoutRef = useRef<number | null>(null);
  const typingFrameRef = useRef<number | null>(null);
  const typingDelayRef = useRef<number | null>(null);
  const lastBgRef = useRef("");
  const pdfUrlRef = useRef("");
  const codeTxtUrlRef = useRef("");
  const bgmRef = useRef<HTMLAudioElement>(new Audio());
  const bgmFadeRef = useRef<HTMLAudioElement>(new Audio());
  const sfxRef = useRef<HTMLAudioElement>(new Audio());
  const bgmUrlRef = useRef("");
  const sfxUrlRef = useRef("");

  const curLine = SCRIPT.lines[index];

  useEffect(() => {
    bgmRef.current.loop = true;
    bgmFadeRef.current.loop = true;
    sfxRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (phase === "title") {
      const timer = window.setTimeout(() => setTitleReady(true), 120);
      return () => window.clearTimeout(timer);
    }
    setTitleReady(false);
    return undefined;
  }, [phase]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--dim", `${settings.dim / 100}`);
    root.setProperty("--sprite-w", `${settings.spriteW}px`);
    root.setProperty("--sprite-h", `${Math.round(settings.spriteW * 1.73)}px`);
    root.setProperty("--sprite-opacity", `${settings.spriteOpacity / 100}`);
    root.setProperty("--bg-scale", `${settings.bgScale / 100}`);
    root.setProperty("--bg-opacity", `${settings.bgOpacity / 100}`);
    root.setProperty("--sprite-y", `${settings.spriteY}px`);
    root.setProperty("--sprite-x", `${settings.spriteX}px`);
    bgmRef.current.volume = settings.bgmVol / 100;
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const refreshBgmList = useCallback(() => {
    try {
      const manifest = JSON.parse(localStorage.getItem(KEY_MANIFEST) || "{}") as Manifest;
      setBgmList(manifest.bgm || []);
      setSfxList(manifest.sfx || []);
    } catch {
      setBgmList([]);
      setSfxList([]);
    }
  }, []);

  useEffect(() => {
    refreshBgmList();
  }, [refreshBgmList]);

  useEffect(() => {
    if (phase !== "playing" || !curLine) return;
    let nextBg = DEFAULT_BG;
    const special = getSpecialBg(index);
    if (special) {
      nextBg = special;
    } else {
      const sceneBg = getSceneBg(curLine.scene);
      if (sceneBg) nextBg = sceneBg;
    }

    if (nextBg !== lastBgRef.current) {
      const nextTransition = curLine.transition || "dissolve";
      setPrevBgUrl(lastBgRef.current);
      setTransitionType(nextTransition);
      setTransitionActive(true);
      const bgTimer = window.setTimeout(() => {
        setBgUrl(nextBg);
        lastBgRef.current = nextBg;
      }, nextTransition === "dissolve" ? 80 : 260);
      const clearTimer = window.setTimeout(() => {
        setTransitionActive(false);
      }, nextTransition === "dissolve" ? 900 : 1050);
      return () => {
        window.clearTimeout(bgTimer);
        window.clearTimeout(clearTimer);
      };
    }
    return undefined;
  }, [curLine, index, phase]);

  const triggerEffect = useCallback((effectName: string) => {
    if (!effectName || effectName === "none") return;
    setEffectActive(effectName);
    const timer = window.setTimeout(() => {
      setEffectActive("");
    }, effectName === "shake" ? 500 : 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "playing" || !curLine) return;
    setShowRain(Boolean(curLine.scene?.includes("雨") || curLine.effect === "rain"));
    setSceneBlur(Boolean(curLine.scene?.includes("梦境") || curLine.scene?.includes("回忆") || curLine.effect === "blur"));
    if (curLine.effect && !["rain", "blur", "none"].includes(curLine.effect)) {
      return triggerEffect(curLine.effect);
    }
    return undefined;
  }, [curLine, phase, triggerEffect]);

  useEffect(() => {
    if (phase !== "playing" || !curLine?.cg) return;
    setCgTitle(curLine.cg);
    setCgImageUrl(getSceneBg(curLine.scene) || bgUrl || DEFAULT_BG);
    setCgVisible(true);
  }, [bgUrl, curLine, phase]);

  useEffect(() => {
    if (phase !== "playing" || !curLine) return;
    setStageChars(getSceneCharacters(SCRIPT.lines, index, curLine.speaker));
  }, [curLine, index, phase]);

  const crossfadeBgm = useCallback(
    async (assetId: string, name: string) => {
      if (!assetId) return;
      try {
        const blob = await AssetDB.get<Blob>(AssetDB.STORE_ASSETS, assetId);
        if (!blob) return;

        if (bgmRef.current.src && bgmPlaying) {
          const oldAudio = bgmRef.current;
          const fadeOut = window.setInterval(() => {
            if (oldAudio.volume > 0.05) {
              oldAudio.volume = Math.max(0, oldAudio.volume - 0.05);
            } else {
              oldAudio.pause();
              window.clearInterval(fadeOut);
            }
          }, 50);
        }

        if (bgmUrlRef.current) URL.revokeObjectURL(bgmUrlRef.current);
        const url = URL.createObjectURL(blob);
        bgmUrlRef.current = url;

        bgmFadeRef.current.src = url;
        bgmFadeRef.current.volume = 0;
        bgmFadeRef.current.muted = bgmMuted;
        await bgmFadeRef.current.play().catch(() => undefined);

        const targetVol = settings.bgmVol / 100;
        const fadeIn = window.setInterval(() => {
          if (bgmFadeRef.current.volume < targetVol - 0.05) {
            bgmFadeRef.current.volume = Math.min(targetVol, bgmFadeRef.current.volume + 0.05);
          } else {
            bgmFadeRef.current.volume = targetVol;
            window.clearInterval(fadeIn);
          }
        }, 50);

        const temp = bgmRef.current;
        bgmRef.current = bgmFadeRef.current;
        bgmFadeRef.current = temp;
        setBgmPlaying(true);
        setCurrentBgmId(assetId);
        setCurrentBgmName(name);
      } catch {
        // ignore autoplay and blob issues
      }
    },
    [bgmMuted, bgmPlaying, settings.bgmVol],
  );

  const stopBgm = useCallback(() => {
    bgmRef.current.pause();
    bgmRef.current.currentTime = 0;
    if (bgmUrlRef.current) {
      URL.revokeObjectURL(bgmUrlRef.current);
      bgmUrlRef.current = "";
    }
    bgmRef.current.removeAttribute("src");
    setBgmPlaying(false);
    setCurrentBgmId("");
    setCurrentBgmName("");
  }, []);

  const loadAndPlayBgm = useCallback(
    async (assetId: string) => {
      if (!assetId) {
        stopBgm();
        return;
      }
      try {
        const blob = await AssetDB.get<Blob>(AssetDB.STORE_ASSETS, assetId);
        if (!blob) return;
        if (bgmUrlRef.current) URL.revokeObjectURL(bgmUrlRef.current);
        const url = URL.createObjectURL(blob);
        bgmUrlRef.current = url;
        bgmRef.current.src = url;
        bgmRef.current.volume = settings.bgmVol / 100;
        bgmRef.current.muted = bgmMuted;
        await bgmRef.current.play().catch(() => undefined);
        setBgmPlaying(true);
        setCurrentBgmId(assetId);
        const match = bgmList.find((item) => item.id === assetId);
        setCurrentBgmName(match?.label || "");
      } catch {
        // ignore
      }
    },
    [bgmList, bgmMuted, settings.bgmVol, stopBgm],
  );

  const playSfx = useCallback(
    async (assetId: string) => {
      if (!assetId) return;
      try {
        const blob = await AssetDB.get<Blob>(AssetDB.STORE_ASSETS, assetId);
        if (!blob) return;
        if (sfxUrlRef.current) URL.revokeObjectURL(sfxUrlRef.current);
        const url = URL.createObjectURL(blob);
        sfxUrlRef.current = url;
        sfxRef.current.src = url;
        sfxRef.current.volume = settings.sfxVol / 100;
        sfxRef.current.currentTime = 0;
        await sfxRef.current.play().catch(() => undefined);
      } catch {
        // ignore
      }
    },
    [settings.sfxVol],
  );

  useEffect(() => {
    if (phase !== "playing" || !curLine?.bgm) return;
    if (curLine.bgm === currentBgmName) return;
    const match = bgmList.find((item) => item.label.includes(curLine.bgm || ""));
    if (match) {
      void crossfadeBgm(match.id, match.label);
    } else {
      setCurrentBgmName(curLine.bgm);
    }
  }, [bgmList, crossfadeBgm, curLine, currentBgmName, phase]);

  useEffect(() => {
    if (phase !== "playing" || !curLine?.sfx) return;
    const match = sfxList.find((item) => item.label.includes(curLine.sfx || ""));
    if (match) {
      void playSfx(match.id);
    }
  }, [curLine, phase, playSfx, sfxList]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (!curLine) {
      setPhase("credits");
      return;
    }
    if (curLine.speaker === "SYSTEM" && curLine.text?.startsWith("JUMP:")) {
      const label = curLine.text.slice(5).trim();
      const target = SCRIPT.labelMap.get(label);
      if (typeof target === "number") {
        setIndex(target);
      } else {
        setIndex((value) => Math.min(SCRIPT.lines.length, value + 1));
      }
      return;
    }

    setCurrentAct(curLine.act);
    setTextVisible(false);
    if (typingFrameRef.current) cancelAnimationFrame(typingFrameRef.current);
    if (typingDelayRef.current) window.clearTimeout(typingDelayRef.current);
    typingDelayRef.current = window.setTimeout(() => {
      setDisplayedText("");
      setTyping(true);
      setTextVisible(true);
      let nextText = curLine.text || "";
      if (curLine.kind === "choice") nextText = "请选择：";
      if (skip || settings.typeMs === 0) {
        setDisplayedText(nextText);
        setTyping(false);
        return;
      }

      let ci = 0;
      let lastTime = performance.now();
      let frameId = 0;
      const frame = (now: number) => {
        const previousChar = nextText[ci - 1] || "";
        const pauseMultiplier = PAUSE_CHARS[previousChar] || 1;
        const effectiveDelay = settings.typeMs * pauseMultiplier;
        const delta = now - lastTime;
        if (delta >= effectiveDelay) {
          const step = pauseMultiplier > 1 ? 1 : Math.max(1, Math.floor(delta / settings.typeMs));
          ci = Math.min(nextText.length, ci + step);
          setDisplayedText(nextText.slice(0, ci));
          lastTime = now;
        }
        if (ci < nextText.length) {
          frameId = requestAnimationFrame(frame);
          typingFrameRef.current = frameId;
        } else {
          setTyping(false);
          typingFrameRef.current = null;
        }
      };
      frameId = requestAnimationFrame(frame);
      typingFrameRef.current = frameId;
    }, 120);

    return () => {
      if (typingDelayRef.current) window.clearTimeout(typingDelayRef.current);
      if (typingFrameRef.current) cancelAnimationFrame(typingFrameRef.current);
    };
  }, [curLine, phase, settings.typeMs, skip]);

  const saveGame = useCallback(() => {
    const data = {
      index,
      log: log.slice(-50),
      act: currentAct,
      bgmName: currentBgmName,
    };
    localStorage.setItem(KEY_SAVE, JSON.stringify(data));
  }, [currentAct, currentBgmName, index, log]);

  const loadGame = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(KEY_SAVE);
      if (!raw) return false;
      const data = JSON.parse(raw) as { index?: number; log?: LogItem[]; act?: string; bgmName?: string };
      setIndex(data.index || 0);
      setLog(data.log || []);
      setCurrentAct(data.act || "");
      setCurrentBgmName(data.bgmName || "");
      return true;
    } catch {
      return false;
    }
  }, []);

  const hasSave = () => Boolean(localStorage.getItem(KEY_SAVE));

  const handleNext = useCallback(() => {
    if (phase !== "playing" || !curLine) return;
    if (cgVisible) {
      setCgVisible(false);
      return;
    }
    if (typing) {
      if (typingFrameRef.current) {
        cancelAnimationFrame(typingFrameRef.current);
        typingFrameRef.current = null;
      }
      setDisplayedText(curLine.kind === "choice" ? "请选择：" : curLine.text || "");
      setTyping(false);
      return;
    }
    if (curLine.kind === "choice") return;
    if (curLine.kind === "label") {
      setIndex((value) => value + 1);
      return;
    }
    if (curLine.speaker && curLine.text) {
      setLog((prev) => [...prev, { who: curLine.speaker || "旁白", text: curLine.text || "" }].slice(-100));
    }
    setIndex((value) => Math.min(SCRIPT.lines.length, value + 1));
  }, [cgVisible, curLine, phase, typing]);

  const handlePrev = useCallback(() => {
    if (phase !== "playing") return;
    setAuto(false);
    setSkip(false);
    setTyping(false);
    if (index <= 0) return;
    let nextIndex = index - 1;
    while (nextIndex > 0) {
      const line = SCRIPT.lines[nextIndex];
      if (line.kind === "label" || line.kind === "choice") {
        nextIndex -= 1;
      } else {
        break;
      }
    }
    setIndex(nextIndex);
  }, [index, phase]);

  const handleChoice = useCallback((cmd: string) => {
    if (cmd.startsWith("@jump")) {
      const label = cmd.replace("@jump", "").trim();
      const target = SCRIPT.labelMap.get(label);
      setIndex(typeof target === "number" ? target : index + 1);
      return;
    }
    setIndex((value) => value + 1);
  }, [index]);

  useEffect(() => {
    if (autoTimeoutRef.current) {
      window.clearTimeout(autoTimeoutRef.current);
    }
    if (phase !== "playing" || (!auto && !skip) || typing || curLine?.kind === "choice" || !curLine) return;
    const delay = skip ? 50 : Math.max(180, settings.autoMs);
    autoTimeoutRef.current = window.setTimeout(handleNext, delay);
    return () => {
      if (autoTimeoutRef.current) {
        window.clearTimeout(autoTimeoutRef.current);
      }
    };
  }, [auto, curLine, handleNext, phase, settings.autoMs, skip, typing]);

  const startNewGame = () => {
    setIndex(0);
    setLog([]);
    lastBgRef.current = "";
    setPhase("playing");
  };

  const continueGame = () => {
    if (loadGame()) {
      lastBgRef.current = "";
      setPhase("playing");
    }
  };

  const toggleBgm = useCallback(() => {
    if (bgmPlaying) {
      bgmRef.current.pause();
      setBgmPlaying(false);
      return;
    }
    if (bgmRef.current.src) {
      void bgmRef.current.play().then(() => setBgmPlaying(true)).catch(() => undefined);
    }
  }, [bgmPlaying]);

  const toggleMute = useCallback(() => {
    const next = !bgmMuted;
    bgmRef.current.muted = next;
    bgmFadeRef.current.muted = next;
    setBgmMuted(next);
  }, [bgmMuted]);

  const togglePanel = (name: string) => {
    setActivePanel((prev) => (prev === name ? null : name));
  };

  const uploadAsset = async (kind: "bg" | "sprite" | "bgm" | "sfx") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "bgm" || kind === "sfx" ? "audio/*" : "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const label = prompt("资源名称", file.name) || file.name;
      const id = `${kind}_${crypto.randomUUID()}`;
      await AssetDB.put(AssetDB.STORE_ASSETS, id, file);
      try {
        const manifest = JSON.parse(localStorage.getItem(KEY_MANIFEST) || "{}") as Record<string, { id: string; label: string }[]>;
        const key = kind === "bg" ? "backgrounds" : kind;
        manifest[key] = manifest[key] || [];
        manifest[key].unshift({ id, label });
        localStorage.setItem(KEY_MANIFEST, JSON.stringify(manifest));
        refreshBgmList();
      } catch {
        // ignore
      }
      alert("上传成功");
    };
    input.click();
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase === "warning") return;
      if (phase === "title") {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          startNewGame();
        }
        return;
      }
      if (phase !== "playing") return;
      if (cgVisible && (event.key === " " || event.key === "Enter" || event.key === "Escape")) {
        event.preventDefault();
        setCgVisible(false);
        return;
      }
      if ((event.key === " " || event.key === "Enter") && !activePanel && !showLog) {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "Backspace" && !activePanel && !showLog) {
        event.preventDefault();
        handlePrev();
      }
      if (event.key.toLowerCase() === "l") setShowLog((value) => !value);
      if (event.key.toLowerCase() === "s") saveGame();
      if (event.key === "Escape") {
        setActivePanel(null);
        setShowLog(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activePanel, cgVisible, handleNext, handlePrev, phase, saveGame, showLog]);

  useEffect(() => {
    if (phase === "playing" && index > 0) {
      saveGame();
    }
  }, [index, phase, saveGame]);

  const loadImageDataUrl = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const buildPdfDoc = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentW = pageW - margin * 2;
    let y = margin;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeBlock = (text: string, size = 11, gap = 6) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, contentW);
      const lineH = size * 0.45 + 1.8;
      ensureSpace(lines.length * lineH + 2);
      doc.text(lines, margin, y);
      y += lines.length * lineH + gap;
    };

    doc.setFont("helvetica", "bold");
    writeBlock("VN Studio - 剧情与内容图片导出", 16, 8);
    doc.setFont("helvetica", "normal");
    writeBlock(`导出时间: ${new Date().toLocaleString()}`, 10, 8);

    writeBlock("第一部分：完整剧情", 13, 6);
    SCRIPT.lines.forEach((line: ScriptLine) => {
      if (line.kind === "label") return;
      if (line.kind === "title") {
        writeBlock(`【${line.text || line.act}】`, 12, 3);
        return;
      }
      if (line.kind === "choice") {
        writeBlock("【选项】", 11, 2);
        (line.options || []).forEach((opt, idx) => writeBlock(`${idx + 1}. ${opt.text}`, 10, 1));
        y += 2;
        return;
      }
      writeBlock(`${line.speaker || "旁白"}: ${line.text || ""}`, 10, 2);
    });

    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    writeBlock("第二部分：内容图片（原图链接与预览）", 13, 6);
    doc.setFont("helvetica", "normal");

    for (let i = 0; i < ALL_CONTENT_IMAGES.length; i += 1) {
      const url = ALL_CONTENT_IMAGES[i];
      writeBlock(`[${i + 1}] ${url}`, 9, 2);
      const dataUrl = await loadImageDataUrl(url);
      if (!dataUrl) {
        writeBlock("预览加载失败，已保留原图链接。", 9, 4);
        continue;
      }
      ensureSpace(50);
      try {
        const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(dataUrl, format, margin, y, contentW, 42);
        y += 48;
      } catch {
        writeBlock("预览加载失败，已保留原图链接。", 9, 4);
      }
    }

    return doc;
  };

  const handleExportPdf = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const doc = await buildPdfDoc();
      doc.save("VN_剧情与内容图片.pdf");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleGeneratePdfLink = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const doc = await buildPdfDoc();
      const blob = doc.output("blob") as Blob;
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      const url = URL.createObjectURL(blob);
      pdfUrlRef.current = url;
      setPdfDownloadUrl(url);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportAllCodeTxt = () => {
    const files = [
      { path: "index.html", content: indexHtmlSource },
      { path: "package.json", content: packageJsonSource },
      { path: "tsconfig.json", content: tsconfigSource },
      { path: "vite.config.ts", content: viteConfigSource },
      { path: "src/main.tsx", content: mainSource },
      { path: "src/App.tsx", content: appSource },
      { path: "src/engine.ts", content: engineSource },
      { path: "src/script.ts", content: scriptSource },
      { path: "src/db.ts", content: dbSource },
      { path: "src/index.css", content: cssSource },
      { path: "src/utils/cn.ts", content: cnSource },
    ];

    const header = [
      "VN Studio - 全部代码导出",
      `导出时间: ${new Date().toLocaleString()}`,
      `文件数: ${files.length}`,
      "",
      "========================================",
      "",
    ].join("\n");

    const body = files
      .map((file) =>
        [
          `FILE: ${file.path}`,
          "----------------------------------------",
          file.content,
          "",
          "========================================",
          "",
        ].join("\n"),
      )
      .join("");

    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    if (codeTxtUrlRef.current) URL.revokeObjectURL(codeTxtUrlRef.current);
    const url = URL.createObjectURL(blob);
    codeTxtUrlRef.current = url;
    setCodeTxtUrl(url);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "VN_全部代码.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      if (codeTxtUrlRef.current) URL.revokeObjectURL(codeTxtUrlRef.current);
      if (bgmUrlRef.current) URL.revokeObjectURL(bgmUrlRef.current);
      if (sfxUrlRef.current) URL.revokeObjectURL(sfxUrlRef.current);
    };
  }, []);

  const effectClasses = [
    effectActive === "shake" ? "fx-shake" : "",
    effectActive === "flash-white" ? "fx-flash-white" : "",
    effectActive === "flash-red" ? "fx-flash-red" : "",
    effectActive === "darken" ? "fx-darken" : "",
    effectActive === "brighten" ? "fx-brighten" : "",
    sceneBlur ? "fx-scene-blur" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const speaker = curLine?.speaker;
  const showName = Boolean(speaker && speaker !== "旁白" && speaker !== "SYSTEM");
  const speakerColor = speaker ? CHARACTER_COLORS[speaker] || "rgba(255,241,248,0.96)" : "rgba(255,241,248,0.96)";
  const speakerAvatar = speaker ? CHARACTER_SPRITES[speaker] || "" : "";
  const currentBgmLabel = bgmList.find((item) => item.id === currentBgmId)?.label || currentBgmName || "";

  return (
    <div id="app-root">
      {phase === "warning" && (
        <div id="warning-screen">
          <div id="warning-content">
            <div id="warning-text">
              <p>本游戏包含悬疑、暴力暗示与心理惊悚内容，建议成年或有监护同意的玩家体验。</p>
              <p>故事涉及校园命案、创伤记忆与灵异叙事，请根据自己的接受程度决定是否继续。</p>
              <p>如果你已经了解这些内容，可以进入标题界面。</p>
            </div>
            <button id="warning-btn" onClick={() => setPhase("title")}>
              我已了解并继续
            </button>
          </div>
        </div>
      )}

      {phase === "title" && (
        <div id="title-screen" className={titleReady ? "ready" : ""}>
          <div className="title-bg" style={{ backgroundImage: `url("${DEFAULT_BG}")` }} />
          <div className="title-overlay" />
          <DustCanvas />
          <div className="title-content">
            <div className="title-logo">
              <div className="title-main">魂归于天</div>
              <div className="title-sub">A Soul Returns to the Sky</div>
            </div>
            <div className="title-menu">
              <button className="title-btn" onClick={startNewGame}>
                <span className="title-btn-icon">▶</span>
                <span>开始游戏</span>
              </button>
              {hasSave() && (
                <button className="title-btn" onClick={continueGame}>
                  <span className="title-btn-icon">↻</span>
                  <span>继续游戏</span>
                </button>
              )}
              <button
                className="title-btn"
                onClick={() => {
                  setPhase("playing");
                  togglePanel("settings");
                }}
              >
                <span className="title-btn-icon">⚙</span>
                <span>设置</span>
              </button>
              <button
                className="title-btn"
                onClick={() => {
                  setPhase("playing");
                  togglePanel("assets");
                }}
              >
                <span className="title-btn-icon">♫</span>
                <span>资源管理</span>
              </button>
            </div>
            <div className="title-footer">VN Studio · Press SPACE to Start</div>
          </div>
        </div>
      )}

      {phase === "credits" && (
        <div id="credits-screen" className="show">
          <div id="credits-content">
            <div className="credit-title">制作团队</div>
            <div className="credit-role">编剧</div>
            <div className="credit-name">Ray、Justin</div>
            <div className="credit-role">导演</div>
            <div className="credit-name">Ray、Justin</div>
            <div className="credit-role">艺术总监</div>
            <div className="credit-name">Ray</div>
            <div className="credit-role">程序员</div>
            <div className="credit-name">AI</div>
            <div className="credit-role">测试人员</div>
            <div className="credit-name">Ray、Justin</div>
            <div className="credit-role" style={{ marginTop: 100 }}>
              感谢游玩
            </div>
            <button className="btn" style={{ marginTop: 40 }} onClick={() => setPhase("title")}>
              返回标题
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className={`game-screen ${effectClasses}`}>
          <div className="bg-container">
            {prevBgUrl && transitionActive && transitionType === "dissolve" && (
              <div className="bg-layer bg-prev" style={{ backgroundImage: `url("${prevBgUrl}")` }} />
            )}
            <div
              className={`bg-layer bg-current ${transitionActive && transitionType === "dissolve" ? "bg-dissolve-in" : ""}`}
              style={{ backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined }}
            />
          </div>

          <div className={`transition-overlay ${transitionActive ? `active ${transitionType}` : ""}`} />
          <div id="dim" />
          <DustCanvas />
          <RainCanvas active={showRain} />

          <div id="stage">
            {stageChars.map((ch) => (
              <div
                key={ch.name}
                className={`sprite-multi show ${ch.position} ${ch.isSpeaking ? "speaking" : "not-speaking"}`}
                style={{ backgroundImage: `url("${ch.spriteUrl}")` }}
              />
            ))}
          </div>

          <div id="fx" />

          {cgVisible && (
            <div className="cg-overlay" onClick={() => setCgVisible(false)}>
              <div className="cg-panel" onClick={(event) => event.stopPropagation()}>
                <div className="cg-art" style={{ backgroundImage: `url("${cgImageUrl}")` }} />
                <div className="cg-meta">
                  <div className="cg-kicker">CG</div>
                  <div className="cg-title">{cgTitle}</div>
                  <button className="btn cg-close" onClick={() => setCgVisible(false)}>
                    继续
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="panelBar">
            <button className="pbtn" onClick={handlePrev}>
              ◀
            </button>
            <button className="pbtn" onClick={handleNext}>
              ▶
            </button>
            <button className="pbtn" aria-pressed={auto} onClick={() => { setAuto(!auto); setSkip(false); }}>
              自动
            </button>
            <button className="pbtn" aria-pressed={skip} onClick={() => { setSkip(!skip); setAuto(false); }}>
              跳过
            </button>
            <button className="pbtn" onClick={() => setShowLog(true)}>
              历史
            </button>
            <button className="pbtn" onClick={() => togglePanel("assets")}>
              资源
            </button>
            <button className="pbtn" onClick={() => togglePanel("settings")}>
              设置
            </button>
            <button className="pbtn" aria-pressed={activePanel === "bgm"} onClick={() => togglePanel("bgm")}>
              {bgmPlaying && !bgmMuted ? "♫" : "BGM"}
            </button>
            <button className="pbtn" onClick={saveGame}>
              存档
            </button>
            <button className="pbtn" onClick={() => { setPhase("title"); setAuto(false); setSkip(false); }}>
              标题
            </button>
            <button className="pbtn" onClick={handleExportPdf} disabled={exportingPdf}>
              {exportingPdf ? "..." : "PDF"}
            </button>
            <button className="pbtn" onClick={handleGeneratePdfLink} disabled={exportingPdf}>
              PDF链接
            </button>
            {pdfDownloadUrl && (
              <a className="pbtn" href={pdfDownloadUrl} download="VN_剧情与内容图片.pdf" style={{ textDecoration: "none" }}>
                ⬇PDF
              </a>
            )}
            <button className="pbtn" onClick={handleExportAllCodeTxt}>
              代码
            </button>
            {codeTxtUrl && (
              <a className="pbtn" href={codeTxtUrl} download="VN_全部代码.txt" style={{ textDecoration: "none" }}>
                ⬇TXT
              </a>
            )}
          </div>

          <div className={`panel ${activePanel === "assets" ? "show" : ""}`}>
            <div className="card">
              <div className="row">
                <button className="btn" onClick={() => uploadAsset("bg")}>
                  上传背景
                </button>
                <button className="btn" onClick={() => uploadAsset("sprite")}>
                  上传立绘
                </button>
                <button className="btn" onClick={() => uploadAsset("bgm")}>
                  上传BGM
                </button>
                <button className="btn" onClick={() => uploadAsset("sfx")}>
                  上传音效
                </button>
              </div>
              <div className="tiny">资源会保存在浏览器本地（IndexedDB）。</div>
              <div className="tiny" style={{ marginTop: 6 }}>音效资源会按文件名和脚本里的音效文字自动匹配。</div>
            </div>
          </div>

          <div className={`panel ${activePanel === "settings" ? "show" : ""}`}>
            <div className="card">
              <div className="row">
                <span className="label">文字速度</span>
                <input type="range" min="0" max="60" value={settings.typeMs} onChange={(e) => setSettings((s) => ({ ...s, typeMs: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.typeMs}ms</span>
              </div>
              <div className="row">
                <span className="label">自动间隔</span>
                <input type="range" min="180" max="2200" step="20" value={settings.autoMs} onChange={(e) => setSettings((s) => ({ ...s, autoMs: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.autoMs}ms</span>
              </div>
              <div className="row">
                <span className="label">屏幕暗度</span>
                <input type="range" min="0" max="40" value={settings.dim} onChange={(e) => setSettings((s) => ({ ...s, dim: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.dim}%</span>
              </div>
              <div className="row">
                <span className="label">立绘尺寸</span>
                <input type="range" min="140" max="420" step="10" value={settings.spriteW} onChange={(e) => setSettings((s) => ({ ...s, spriteW: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.spriteW}px</span>
              </div>
              <div className="row">
                <span className="label">立绘透明度</span>
                <input type="range" min="0" max="100" value={settings.spriteOpacity} onChange={(e) => setSettings((s) => ({ ...s, spriteOpacity: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.spriteOpacity}%</span>
              </div>
              <div className="row">
                <span className="label">背景缩放</span>
                <input type="range" min="100" max="150" value={settings.bgScale} onChange={(e) => setSettings((s) => ({ ...s, bgScale: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.bgScale}%</span>
              </div>
              <div className="row">
                <button className="btn" onClick={() => setSettings(DEFAULT_SETTINGS)}>
                  恢复默认
                </button>
                <span className="tiny">空格/回车下一句 · Backspace回退 · L历史 · S存档</span>
              </div>
            </div>
            <div className="card">
              <div className="row">
                <span className="label">场景信息</span>
                <span className="tiny mono">
                  #{index} · {curLine?.scene || "无场景标记"}
                </span>
              </div>
              {currentBgmName && (
                <div className="row">
                  <span className="label">当前BGM</span>
                  <span className="tiny mono">{currentBgmName}</span>
                </div>
              )}
              {curLine?.effect && (
                <div className="row">
                  <span className="label">当前特效</span>
                  <span className="tiny mono">{curLine.effect}</span>
                </div>
              )}
            </div>
          </div>

          <div className={`panel ${activePanel === "bgm" ? "show" : ""}`}>
            <div className="card">
              <div className="panel-title">BGM 控制</div>
              <div className="bgm-controls-row">
                <button className={`bgm-ctrl-btn ${bgmPlaying ? "active" : ""}`} onClick={toggleBgm}>
                  {bgmPlaying ? "⏸ 暂停" : "▶ 播放"}
                </button>
                <button className="bgm-ctrl-btn" onClick={stopBgm}>
                  ⏹ 停止
                </button>
                <button className={`bgm-ctrl-btn ${bgmMuted ? "muted" : ""}`} onClick={toggleMute}>
                  {bgmMuted ? "🔇 静音中" : "🔊 有声"}
                </button>
              </div>
              <div className="bgm-now-playing">
                {currentBgmLabel ? <span>正在播放：<strong>{currentBgmLabel}</strong></span> : <span className="bgm-no-music">未选择BGM</span>}
              </div>
            </div>
            <div className="card">
              <div className="panel-title">选择BGM</div>
              <div className="row">
                <select className="bgm-panel-select" value={currentBgmId} onChange={(e) => void loadAndPlayBgm(e.target.value)}>
                  <option value="">-- 无 --</option>
                  {bgmList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tiny">先在“资源”面板上传BGM文件，然后在这里选择播放。</div>
            </div>
            <div className="card">
              <div className="panel-title">音量</div>
              <div className="row">
                <span className="label">BGM音量</span>
                <input type="range" min="0" max="100" value={settings.bgmVol} onChange={(e) => setSettings((s) => ({ ...s, bgmVol: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.bgmVol}%</span>
              </div>
              <div className="row">
                <span className="label">音效音量</span>
                <input type="range" min="0" max="100" value={settings.sfxVol} onChange={(e) => setSettings((s) => ({ ...s, sfxVol: Number(e.target.value) }))} />
                <span className="tiny mono">{settings.sfxVol}%</span>
              </div>
            </div>
            <div className="card">
              <div className="panel-title">音效资源</div>
              <div className="tiny">已上传音效：{sfxList.length}</div>
              <div className="tiny" style={{ marginTop: 4 }}>建议文件名包含脚本关键词，比如“心跳声加速”“滑倒声”“敲门声”。</div>
            </div>
          </div>

          <div id="hud" style={{ display: curLine ? "block" : "none" }}>
            <div id="box" className={!typing && curLine?.kind !== "choice" ? "can-advance" : ""} onClick={() => { if (!curLine?.options) handleNext(); }}>
              {currentBgmName && (
                <div className="bgm-indicator">
                  <span className="bgm-indicator-icon">{bgmPlaying && !bgmMuted ? "♫" : "♪"}</span>
                  <span className="bgm-indicator-text">{currentBgmName}</span>
                </div>
              )}

              <div id="name" style={{ display: showName ? "flex" : "none" }}>
                <span className="name-line-left" style={{ background: `linear-gradient(to right, transparent 0%, ${speakerColor} 100%)` }} />
                <span className="name-text-inner" style={{ color: speakerColor, borderColor: speakerColor.replace("0.95", "0.32") }}>
                  {speakerAvatar && <span className="name-avatar" style={{ backgroundImage: `url("${speakerAvatar}")` }} />}
                  <span>{speaker}</span>
                </span>
                <span className="name-line-right" style={{ background: `linear-gradient(to left, transparent 0%, ${speakerColor} 100%)` }} />
              </div>

              <div id="text" className={`${textVisible ? "show" : "text-exit"}`}>
                {curLine?.kind === "choice" ? "请选择：" : displayedText}
              </div>

              <div id="choices" className={curLine?.kind === "choice" ? "show" : ""}>
                {curLine?.kind === "choice" &&
                  curLine.options?.map((opt, idx) => (
                    <button key={`${opt.text}_${idx}`} className="choice" onClick={(e) => { e.stopPropagation(); handleChoice(opt.cmd); }}>
                      {opt.text}
                    </button>
                  ))}
              </div>

              <div id="subline">
                <div className="left">
                  <span className="pill">{currentAct || "__ACT__"}</span>
                  <span className="pill">
                    {Math.min(index + 1, SCRIPT.lines.length)}/{SCRIPT.lines.length}
                  </span>
                </div>
                <div className="right">
                  <span className="pill">{skip ? "SKIP" : auto ? "AUTO" : typing ? "TYPE" : "READY"}</span>
                  {curLine?.sfx && <span className="pill sfx-pill">🔔 {curLine.sfx}</span>}
                </div>
              </div>
            </div>
          </div>

          <div id="backlog" className={showLog ? "show" : ""}>
            <div className="wrap">
              <div className="top">
                <div className="t">历史记录</div>
                <button className="btn" onClick={() => setShowLog(false)}>
                  关闭
                </button>
              </div>
              <div className="list">
                {log
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <div key={`${item.who}_${idx}`} className="logItem">
                      <div className="who">{item.who}</div>
                      <div className="say">{item.text}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
