const BASE = "https://web-production-42c88.up.railway.app";

export interface Status {
  total_videos: number;
  postados: number;
  restantes: number;
  ultimo_post: string;
}

export interface Post {
  filename: string;
  post_id: string;
  caption: string;
  video_url: string;
  posted_at: string;
}

export interface PostStatus {
  running: boolean;
  current_step: string | null;
  last_result: string;
}

export const fetchStatus = async (): Promise<Status> => {
  const res = await fetch(`${BASE}/status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
};

export const fetchPosts = async (): Promise<Post[]> => {
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  return data.posts ?? [];
};

export const fetchPostStatus = async (): Promise<PostStatus> => {
  const res = await fetch(`${BASE}/post/status`);
  if (!res.ok) throw new Error("Failed to fetch post status");
  return res.json();
};

export const triggerPostNow = async (): Promise<void> => {
  const res = await fetch(`${BASE}/post/now`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger post");
};

export interface PostAnalytics {
  filename: string;
  post_id: string;
  caption: string;
  posted_at: string;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  watch_time_ms: number;
  hour: number | null;
  day: number | null;
}

export const fetchAnalytics = async (): Promise<PostAnalytics[]> => {
  const res = await fetch(`${BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const data = await res.json();
  return data.posts ?? [];
};

export const fetchQueue = async (): Promise<string[]> => {
  const res = await fetch(`${BASE}/queue`);
  if (!res.ok) throw new Error("Failed to fetch queue");
  const data = await res.json();
  return data.queue ?? [];
};

export interface AppSettings {
  auto_post: boolean;
  posts_per_day: number;
  interval_minutes: number;
  start_hour: string;
  end_hour: string;
  active_days: number[];
}

export const fetchSettings = async (): Promise<AppSettings> => {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  const res = await fetch(`${BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
};
