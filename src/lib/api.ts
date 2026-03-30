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
  plays: number;
  likes: number;
  comments: number;
  saved: number;
  reach: number;
  hour: number | null;
  day: number | null;
}

export const fetchAnalytics = async (): Promise<PostAnalytics[]> => {
  const res = await fetch(`${BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const data = await res.json();
  return data.posts ?? [];
};
