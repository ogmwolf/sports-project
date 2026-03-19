"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import postsData from "@/data/posts.json";
import schoolsData from "@/data/schools.json";
import athleteData from "@/data/athlete.json";

// ── Types ──
export type Tab = "profile" | "recruiting" | "feed";

export interface Athlete {
  id: string;
  name: string;
  initials: string;
  position: string;
  /** Primary sport — use sports[0] as canonical fallback */
  sports: string[];
  gender: "female" | "male" | null;
  number: number;
  classYear: number;
  club: string;
  height: string;
  weight: string;
  handedness: string;
  location: string;
  gpa: number;
  school?: string;
  bio?: string;
  secondarySport?: string;
  stats: {
    killPct?: number;
    killsPerSet?: number;
    attacksPerSet?: number;
    hitPct?: number;
    nationalRank: number;
    stateRank: number;
    state: string;
    [key: string]: number | string | undefined;
  };
  highlights: { id: string; title: string; views: string; duration: string }[];
  endorsements: { id: string; coach: string; title: string; initials: string; verified: boolean; text: string }[];
}

interface Comment {
  id: string;
  author: string;
  initials: string;
  text: string;
  timestamp: string;
  badge?: string;
  avatarBg?: string;
}

interface Post {
  id: string;
  author: string;
  initials: string;
  position: string | null;
  club: string;
  classYear: number | null;
  timestamp: string;
  body: string;
  isClub?: boolean;
  isBot?: boolean;
  isOfficial?: boolean;
  milestone?: { type: string; text: string; detail: string };
  clip?: { title: string; duration: string };
  prQuote?: { text: string; source: string };
  photo?: { url: string };
  platforms: string[];
  reactions: number;
  reactLabel?: string;
  comments: Comment[];
}

export interface School {
  id: string;
  name: string;
  abbr: string;
  division: string;
  conference: string;
  location: string;
  color: string;
  status: string;
  coach: string;
  lastContact: string;
  notes: string;
  pipelineStep: number;
}

interface Toast {
  id: string;
  message: string;
}

interface AppState {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  athlete: Athlete;
  updateAthlete: (updates: Partial<Athlete>) => void;
  posts: Post[];
  likedPosts: Set<string>;
  toggleLike: (id: string) => void;
  followedUsers: Set<string>;
  toggleFollowUser: (id: string) => void;
  comments: Record<string, Comment[]>;
  addComment: (postId: string, text: string) => void;
  addPost: (post: Post) => void;
  deletePost: (id: string) => void;
  updatePost: (id: string, body: string) => void;
  schools: School[];
  addSchool: (s: School) => void;
  updateSchool: (id: string, updates: Partial<School>) => void;
  selectedSchoolId: string | null;
  selectSchool: (id: string | null) => void;
  followedSchools: Set<string>;
  toggleFollowSchool: (id: string) => void;
  toasts: Toast[];
  showToast: (message: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [athlete, setAthlete] = useState<Athlete>(athleteData as Athlete);
  const [posts, setPosts] = useState<Post[]>(postsData as Post[]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    const init: Record<string, Comment[]> = {};
    (postsData as Post[]).forEach(p => { init[p.id] = p.comments || []; });
    return init;
  });
  const [schools, setSchools] = useState<School[]>(schoolsData as School[]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>((schoolsData as { id: string }[])[0]?.id ?? null);
  const [followedSchools, setFollowedSchools] = useState<Set<string>>(new Set(["pepperdine"]));
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toggleLike = useCallback((id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleFollowUser = useCallback((id: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    const c: Comment = {
      id: `c${Date.now()}`,
      author: "Sofia Reyes",
      initials: "SR",
      text,
      timestamp: "just now",
    };
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), c] }));
  }, []);

  const updateAthlete = useCallback((updates: Partial<Athlete>) => {
    setAthlete(prev => ({ ...prev, ...updates }));
  }, []);

  const addPost = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev]);
    setComments(prev => ({ ...prev, [post.id]: [] }));
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePost = useCallback((id: string, body: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, body } : p));
  }, []);

  const addSchool = useCallback((s: School) => {
    setSchools(prev => [...prev, s]);
    setSelectedSchoolId(s.id);
  }, []);

  const updateSchool = useCallback((id: string, updates: Partial<School>) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const selectSchool = useCallback((id: string | null) => {
    setSelectedSchoolId(id);
  }, []);

  const toggleFollowSchool = useCallback((id: string) => {
    setFollowedSchools(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const showToast = useCallback((message: string) => {
    const id = `t${Date.now()}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      athlete, updateAthlete,
      posts, likedPosts, toggleLike,
      followedUsers, toggleFollowUser,
      comments, addComment, addPost, deletePost, updatePost,
      schools, addSchool, updateSchool, selectedSchoolId, selectSchool,
      followedSchools, toggleFollowSchool,
      toasts, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
