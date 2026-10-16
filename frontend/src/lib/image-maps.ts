/**
 * lib/image-maps.ts — Icon registry and lookup utilities.
 */
import React from "react";
import {
  Archive,
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  Edit,
  Factory,
  FileText,
  Film,
  FolderOpen,
  GraduationCap,
  Landmark,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Package,
  PencilRuler,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Building2,
  Landmark,
  Monitor,
  Film,
  Briefcase,
  Factory,
  PencilRuler,
  ClipboardList,
  Truck,
  ShieldCheck,
  Archive,
  FileText,
  Phone,
  Mail,
  MapPin,
  Send,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Package,
  FolderOpen,
  MessageSquare,
  Settings,
  BarChart3,
};

export const getIcon = (name: string | null, size = 20) => {
  if (!name) return null;
  const Icon = iconMap[name] as
    React.ComponentType<{ size?: number; strokeWidth?: number }> | undefined;
  return Icon ? React.createElement(Icon, { size, strokeWidth: 1.8 }) : null;
};

export const industryImages: Record<string, string> = {
  Semiconductor: "industry-semiconductor.jpg",
  Government: "industry-government.jpg",
  "Corporate Offices": "industry-corporate.jpg",
  Cinemas: "industry-cinemas.jpg",
  "BPO & Technology": "industry-bpo.jpg",
  "Banks & Finance": "industry-banks.jpg",
  "Arenas & Stadiums": "industry-arenas.jpg",
  Academe: "industry-academe.jpg",
};

export const solutionImages: Record<string, string> = {
  "After-Sales Support": "solution-after-sales.jpg",
  "Delivery & Installation": "solution-delivery.jpg",
  "Project Management": "solution-project-mgmt.jpg",
  "Space Planning & Design": "solution-space-planning.jpg",
};
