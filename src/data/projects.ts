import { supabase } from "../lib/supabase";

export interface Project {
  id: string;
  title: string;
  category: string;
  tools: string;
  image: string;
  image_alt: string | null;
  link: string | null;
  display_order: number;
}

/**
 * Fallback shown if Supabase is unreachable (offline, env vars missing,
 * RLS misconfig). Keeps the carousel from rendering empty.
 */
export const fallbackProjects: Project[] = [
  {
    id: "fallback-1",
    title: "MedDiagBot",
    category: "Intelligent Medical Diagnosis Chatbot",
    tools: "Random Forest, Flask, NLP, TextBlob, Python",
    image: "/images/placeholder.webp",
    image_alt: null,
    link: "https://github.com/esfanmerchant",
    display_order: 10,
  },
  {
    id: "fallback-2",
    title: "AgriFlow",
    category: "Agri-Supply Management System",
    tools: "SQL, Full-Stack, Role-based Portals, Chatbot, MySQL",
    image: "/images/placeholder.webp",
    image_alt: null,
    link: "https://github.com/esfanmerchant",
    display_order: 20,
  },
  {
    id: "fallback-3",
    title: "Notion App",
    category: "Productivity Web Application",
    tools: "React.js, JavaScript, Tailwind CSS, Component Architecture",
    image: "/images/placeholder.webp",
    image_alt: null,
    link: "https://github.com/esfanmerchant/Notion",
    display_order: 30,
  },
  {
    id: "fallback-4",
    title: "Netflix Analysis",
    category: "Data Analysis & Visualization",
    tools: "Python, Pandas, NumPy, Matplotlib, Jupyter Notebook",
    image: "/images/placeholder.webp",
    image_alt: null,
    link: "https://github.com/esfanmerchant/Data-Analysis-On-Netflix-Engagement-DataSet-",
    display_order: 40,
  },
];

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, category, tools, image, image_alt, link, display_order")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.warn("[projects] fetch failed, using fallback:", error.message);
    }
    return fallbackProjects;
  }

  return (data ?? []) as Project[];
}
