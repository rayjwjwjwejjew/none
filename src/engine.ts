import { RAW_SCRIPT } from "./script";

export interface ScriptLine {
  kind: "line" | "title" | "label" | "choice";
  act: string;
  speaker?: string;
  text?: string;
  name?: string;
  scene?: string;
  options?: { text: string; cmd: string }[];
  bgm?: string;
  sfx?: string;
  effect?: string;
  transition?: string;
  cg?: string;
}

export interface ParsedScript {
  lines: ScriptLine[];
  labelMap: Map<string, number>;
}

const BG = {
  schoolNight: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
  corridor: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80",
  rooftop: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  rainySchool: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=80",
  dorm: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  cafeteria: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
  underground: "https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?auto=format&fit=crop&w=1600&q=80",
  hospital: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
  garden: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1600&q=80",
  library: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1600&q=80",
  classroom: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1600&q=80",
  bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
  gym: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1600&q=80",
  field: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
} as const;

export const DEFAULT_BG = BG.schoolNight;

export const SCENE_BG: Record<string, string> = {
  underground: BG.underground,
  undergroundDark: BG.underground,
  undergroundDoor: BG.underground,
  corridor: BG.corridor,
  corridorNight: BG.corridor,
  dormNight: BG.dorm,
  dormDay: BG.dorm,
  cafeteria: BG.cafeteria,
  library: BG.library,
  hospital: BG.hospital,
  hospitalRoom: BG.hospital,
  sportsField: BG.field,
  sportsEvening: BG.rooftop,
  basketball: BG.field,
  classroom: BG.classroom,
  classroomEmpty: BG.classroom,
  rooftopSunset: BG.rooftop,
  rooftopDay: BG.rooftop,
  dreamField: BG.field,
  rainy: BG.rainySchool,
  rainyHeavy: BG.rainySchool,
  bus: BG.bus,
  office: BG.classroom,
  gymnasium: BG.gym,
  schoolBldg: BG.classroom,
  schoolDawn: BG.rooftop,
  schoolNight: BG.schoolNight,
  garden: BG.garden,
  gardenRain: BG.rainySchool,
  teacherRoom: BG.dorm,
  adminBldg: BG.classroom,
  schoolEvent: BG.cafeteria,
  stands: BG.field,
  policeScene: BG.schoolNight,
  nightSky: BG.schoolNight,
  overcast: BG.rainySchool,
  sunset: BG.rooftop,
  meetingRoom: BG.classroom,
};

export const CHARACTER_SPRITES: Record<string, string> = {
  锐: "https://i.imgur.com/0swZ6jg.jpeg",
  蒋: "https://i.imgur.com/SStY5m6.jpeg",
  俞: "https://i.imgur.com/BioDQB4.jpeg",
  小猫: "https://i.imgur.com/BioDQB4.jpeg",
  图书管理员老师: "https://i.imgur.com/tdPI7mK.jpeg",
  何老师: "https://i.imgur.com/U8WN9Kb.jpeg",
  老师A: "https://i.imgur.com/82XmTrj.jpeg",
  老师B: "https://i.imgur.com/xE3e54W.jpeg",
  教导处老师: "https://i.imgur.com/vEcaTQf.jpeg",
  旁边老师: "https://i.imgur.com/6hbyRf9.jpeg",
  孙学长: "https://i.imgur.com/rZeZN6Z.jpeg",
  "？？学长": "https://i.imgur.com/rZeZN6Z.jpeg",
  学长: "https://i.imgur.com/rZeZN6Z.jpeg",
  "？？？": "https://i.imgur.com/BioDQB4.jpeg",
  植物人学长的妈妈: "https://i.imgur.com/tdPI7mK.jpeg",
  马佳宁: "https://i.imgur.com/tdPI7mK.jpeg",
  调查员甲: "https://i.imgur.com/vEcaTQf.jpeg",
  调查员乙: "https://i.imgur.com/6hbyRf9.jpeg",
  校领导: "https://i.imgur.com/vEcaTQf.jpeg",
  金仕涵: "https://i.imgur.com/SStY5m6.jpeg",
  体育组组长: "https://i.imgur.com/82XmTrj.jpeg",
  年级组长: "https://i.imgur.com/82XmTrj.jpeg",
  女警员: "https://i.imgur.com/tdPI7mK.jpeg",
};

export const CHARACTER_COLORS: Record<string, string> = {
  锐: "rgba(128, 191, 255, 0.95)",
  蒋: "rgba(255, 193, 122, 0.95)",
  俞: "rgba(176, 226, 177, 0.95)",
  何老师: "rgba(199, 166, 232, 0.95)",
  马佳宁: "rgba(255, 183, 199, 0.95)",
  孙学长: "rgba(236, 214, 139, 0.95)",
};

const SFX_EFFECT_MAP: Record<string, string> = {
  心跳声加速: "shake",
  心跳声: "shake",
  惊恐的心跳声: "shake",
  突然的拉扯声: "shake",
  铁锁断裂声: "shake",
  金属碰撞声: "shake",
  滑倒声: "shake",
  指甲划过硬物的声音: "shake",
  球落入黑暗的回响: "darken",
  厚重的铁门开启声: "shake",
};

const BGM_MOOD_MAP: Record<string, string> = {
  悲伤钢琴曲: "darken",
  恐怖悬疑曲: "darken",
  压抑的氛围曲: "darken",
  不安的夜曲: "darken",
  紧张的高潮曲: "shake",
  沉重的揭示曲: "darken",
  沉重的审判曲: "darken",
  治愈的告别曲: "brighten",
  忧郁的钢琴曲: "darken",
};

function getSceneTransition(scene: string): string {
  if (scene.includes("梦境") || scene.includes("回忆")) return "fade-white";
  if (scene.includes("花园") || scene.includes("操场") || scene.includes("天台")) return "expand";
  if (scene.includes("会议室") || scene.includes("体育馆") || scene.includes("大会")) return "blinds";
  if (
    scene.includes("夜") ||
    scene.includes("深夜") ||
    scene.includes("地下室") ||
    scene.includes("暴雨")
  ) {
    return "fade-black";
  }
  return "dissolve";
}

function getSceneEffect(scene: string): string | undefined {
  if (scene.includes("暴雨") || scene.includes("雨")) return "rain";
  if (scene.includes("梦境") || scene.includes("回忆")) return "blur";
  return undefined;
}

export function getSceneBg(scene: string | undefined): string | null {
  if (!scene) return null;
  const s = scene;
  if (s.includes("地下室") && (s.includes("门口") || s.includes("入口"))) return SCENE_BG.undergroundDoor;
  if (s.includes("地下室")) return SCENE_BG.undergroundDark;
  if (s.includes("天台")) return s.includes("夕阳") ? SCENE_BG.rooftopSunset : SCENE_BG.rooftopDay;
  if (s.includes("梦境") || s.includes("回忆")) return SCENE_BG.dreamField;
  if (s.includes("图书馆")) return SCENE_BG.library;
  if (s.includes("食堂")) return SCENE_BG.cafeteria;
  if (s.includes("病房")) return SCENE_BG.hospitalRoom;
  if (s.includes("医院")) return SCENE_BG.hospital;
  if (s.includes("暴雨")) return SCENE_BG.rainyHeavy;
  if (s.includes("雨")) return SCENE_BG.rainy;
  if (s.includes("花园") || s.includes("花圃")) return s.includes("雨") ? SCENE_BG.gardenRain : SCENE_BG.garden;
  if (s.includes("操场")) return s.includes("晚") ? SCENE_BG.sportsEvening : SCENE_BG.sportsField;
  if (s.includes("篮球场")) return SCENE_BG.basketball;
  if (s.includes("公交车") || s.includes("回学校")) return SCENE_BG.bus;
  if (s.includes("体育馆") || s.includes("大会")) return SCENE_BG.gymnasium;
  if (s.includes("行政楼")) return SCENE_BG.adminBldg;
  if (s.includes("教导处") || s.includes("办公")) return SCENE_BG.office;
  if (s.includes("会议室")) return SCENE_BG.meetingRoom;
  if (s.includes("何老师房间") || s.includes("教工宿舍")) return SCENE_BG.teacherRoom;
  if (s.includes("教室") || s.includes("教学楼") || s.includes("早读") || s.includes("自习")) return SCENE_BG.classroom;
  if (s.includes("走廊")) return SCENE_BG.corridor;
  if (s.includes("寝室") || s.includes("宿舍")) return s.includes("夜") ? SCENE_BG.dormNight : SCENE_BG.dormDay;
  if (s.includes("校友")) return SCENE_BG.schoolEvent;
  if (s.includes("公告栏")) return SCENE_BG.schoolBldg;
  if (s.includes("黎明")) return SCENE_BG.schoolDawn;
  if (s.includes("警") || s.includes("调查")) return SCENE_BG.policeScene;
  if (s.includes("阴")) return SCENE_BG.overcast;
  if (s.includes("黄昏") || s.includes("夕阳") || s.includes("傍晚")) return SCENE_BG.sunset;
  if (s.includes("夜")) return SCENE_BG.schoolNight;
  return null;
}

export function parseScript(raw: string): ParsedScript {
  const linesRaw = raw.split(/\r?\n/);
  const out: ScriptLine[] = [];
  let act = "第一幕";
  let bracketSpeaker: string | null = null;
  let currentScene: string | undefined;
  let pendingBgm: string | undefined;
  let pendingSfx: string | undefined;
  let pendingEffect: string | undefined;
  let pendingTransition: string | undefined;
  let pendingCg: string | undefined;

  const actRe = /^第([一二三四五六七八九十百0-9]+)幕：(.+)$/;
  const transRe = /^(过渡幕|尾声)：(.+)$/;

  for (let i = 0; i < linesRaw.length; i += 1) {
    let line = linesRaw[i].trim();
    if (!line) continue;

    const actMatch = line.match(actRe);
    if (actMatch) {
      act = `第${actMatch[1]}幕：${actMatch[2].trim()}`;
      out.push({
        kind: "title",
        act,
        speaker: "SYSTEM",
        text: act,
        scene: currentScene,
        bgm: pendingBgm,
        sfx: pendingSfx,
        effect: pendingEffect,
        transition: "fade-black",
        cg: pendingCg,
      });
      pendingBgm = undefined;
      pendingSfx = undefined;
      pendingEffect = undefined;
      pendingTransition = undefined;
      pendingCg = undefined;
      bracketSpeaker = null;
      continue;
    }

    const transMatch = line.match(transRe);
    if (transMatch) {
      act = `${transMatch[1]}：${transMatch[2].trim()}`;
      out.push({
        kind: "title",
        act,
        speaker: "SYSTEM",
        text: act,
        scene: currentScene,
        bgm: pendingBgm,
        sfx: pendingSfx,
        effect: pendingEffect,
        transition: "fade-black",
        cg: pendingCg,
      });
      pendingBgm = undefined;
      pendingSfx = undefined;
      pendingEffect = undefined;
      pendingTransition = undefined;
      pendingCg = undefined;
      bracketSpeaker = null;
      continue;
    }

    if (line.startsWith("::")) {
      out.push({ kind: "label", act, name: line.slice(2).trim(), scene: currentScene });
      bracketSpeaker = null;
      continue;
    }

    const bracket = line.match(/^【(.+?)】$/);
    if (bracket) {
      const tag = bracket[1].trim();
      if (tag.startsWith("场景：") || tag.startsWith("场景:")) {
        currentScene = tag.replace(/^场景[：:]/, "").trim();
        pendingTransition = getSceneTransition(currentScene);
        pendingEffect = getSceneEffect(currentScene) ?? pendingEffect;
        bracketSpeaker = null;
        continue;
      }
      if (tag.startsWith("BGM：") || tag.startsWith("BGM:")) {
        pendingBgm = tag.replace(/^BGM[：:]/, "").trim();
        pendingEffect = pendingEffect ?? BGM_MOOD_MAP[pendingBgm];
        bracketSpeaker = null;
        continue;
      }
      if (tag.startsWith("音效：") || tag.startsWith("音效:")) {
        pendingSfx = tag.replace(/^音效[：:]/, "").trim();
        pendingEffect = SFX_EFFECT_MAP[pendingSfx] ?? pendingEffect;
        bracketSpeaker = null;
        continue;
      }
      if (tag.startsWith("CG：") || tag.startsWith("CG:")) {
        pendingCg = tag.replace(/^CG[：:]/, "").trim();
        pendingTransition = pendingTransition ?? "fade-white";
        bracketSpeaker = null;
        continue;
      }
      if (tag.includes("·内心")) {
        bracketSpeaker = "SKIP_INNER";
        continue;
      }
      bracketSpeaker = tag;
      continue;
    }

    if (bracketSpeaker === "SKIP_INNER") {
      continue;
    }

    if (line.toLowerCase() === "[[choice]]") {
      const options: { text: string; cmd: string }[] = [];
      while (i + 1 < linesRaw.length) {
        const next = linesRaw[i + 1].trim();
        if (!next) {
          i += 1;
          continue;
        }
        if (!/^(-\s*)?.+\s*->\s*.+$/.test(next)) break;
        i += 1;
        const content = next.replace(/^-+\s*/, "");
        const [text = "……", cmd = ""] = content.split("->").map((item) => item.trim());
        options.push({ text, cmd });
      }
      out.push({
        kind: "choice",
        act,
        speaker: "SYSTEM",
        options,
        scene: currentScene,
        bgm: pendingBgm,
        sfx: pendingSfx,
        effect: pendingEffect,
        transition: pendingTransition,
        cg: pendingCg,
      });
      pendingBgm = undefined;
      pendingSfx = undefined;
      pendingEffect = undefined;
      pendingTransition = undefined;
      pendingCg = undefined;
      bracketSpeaker = null;
      continue;
    }

    if (line.startsWith("@jump ")) {
      const label = line.replace("@jump", "").trim();
      out.push({ kind: "line", act, speaker: "SYSTEM", text: `JUMP:${label}`, scene: currentScene });
      continue;
    }

    line = line.replace(/^\*+(.+?)\*+\s*/, "$1");

    const dialogueIdx = line.indexOf("：");
    if (dialogueIdx > 0 && dialogueIdx < 24) {
      const speaker = line.slice(0, dialogueIdx).replace(/^\*+|\*+$/g, "").trim();
      const text = line.slice(dialogueIdx + 1).trim() || "……";
      out.push({
        kind: "line",
        act,
        speaker,
        text,
        scene: currentScene,
        bgm: pendingBgm,
        sfx: pendingSfx,
        effect: pendingEffect,
        transition: pendingTransition,
        cg: pendingCg,
      });
      pendingBgm = undefined;
      pendingSfx = undefined;
      pendingEffect = undefined;
      pendingTransition = undefined;
      pendingCg = undefined;
      bracketSpeaker = null;
      continue;
    }

    const speaker = bracketSpeaker ?? "旁白";
    out.push({
      kind: "line",
      act,
      speaker,
      text: line,
      scene: currentScene,
      bgm: pendingBgm,
      sfx: pendingSfx,
      effect: pendingEffect,
      transition: pendingTransition,
      cg: pendingCg,
    });
    pendingBgm = undefined;
    pendingSfx = undefined;
    pendingEffect = undefined;
    pendingTransition = undefined;
    pendingCg = undefined;
  }

  const labelMap = new Map<string, number>();
  out.forEach((item, idx) => {
    if (item.kind === "label" && item.name) {
      labelMap.set(item.name, idx);
    }
  });

  return { lines: out, labelMap };
}

export const SCRIPT = parseScript(RAW_SCRIPT);

export function getSpecialBg(index: number): string | null {
  if (index >= 1 && index <= 6) return BG.schoolNight;
  if (index >= 35 && index <= 55) return BG.underground;
  if (index >= 200 && index <= 260) return BG.rainySchool;
  return null;
}

export interface StageCharacter {
  name: string;
  position: "left" | "center" | "right";
  spriteUrl: string;
  isSpeaking: boolean;
}

export function getSceneCharacters(
  lines: ScriptLine[],
  currentIndex: number,
  currentSpeaker: string | undefined,
): StageCharacter[] {
  const curScene = lines[currentIndex]?.scene;
  const recent: string[] = [];

  for (let i = currentIndex; i >= Math.max(0, currentIndex - 15); i -= 1) {
    const line = lines[i];
    if (line.scene !== curScene && line.scene && curScene) break;
    if (
      line.speaker &&
      line.speaker !== "旁白" &&
      line.speaker !== "SYSTEM" &&
      CHARACTER_SPRITES[line.speaker] &&
      !recent.includes(line.speaker)
    ) {
      recent.push(line.speaker);
    }
    if (recent.length >= 3) break;
  }

  if (recent.length === 0 && currentSpeaker && CHARACTER_SPRITES[currentSpeaker]) {
    recent.push(currentSpeaker);
  }
  if (recent.length === 0) return [];

  const positions: StageCharacter["position"][] =
    recent.length === 1 ? ["center"] : recent.length === 2 ? ["left", "right"] : ["left", "center", "right"];

  return recent.map((name, idx) => ({
    name,
    position: positions[idx] ?? "center",
    spriteUrl: CHARACTER_SPRITES[name],
    isSpeaking: name === currentSpeaker,
  }));
}

export const ALL_CONTENT_IMAGES: string[] = Array.from(
  new Set([
    DEFAULT_BG,
    ...Object.values(SCENE_BG),
    ...Object.values(CHARACTER_SPRITES),
  ]),
);
