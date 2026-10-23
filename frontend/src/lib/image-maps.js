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
  Truck
} from "lucide-react";
const iconMap = {
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
  BarChart3
};
const getIcon = (name, size = 20) => {
  if (!name) return null;
  const Icon = iconMap[name];
  return Icon ? React.createElement(Icon, { size, strokeWidth: 1.8 }) : null;
};
const industryImages = {
  Semiconductor: "industry-semiconductor.jpg",
  Government: "industry-government.jpg",
  "Corporate Offices": "industry-corporate.jpg",
  Cinemas: "industry-cinemas.jpg",
  "BPO & Technology": "industry-bpo.jpg",
  "Banks & Finance": "industry-banks.jpg",
  "Arenas & Stadiums": "industry-arenas.jpg",
  Academe: "industry-academe.jpg"
};
const solutionImages = {
  "After-Sales Support": "solution-after-sales.jpg",
  "Delivery & Installation": "solution-delivery.jpg",
  "Project Management": "solution-project-mgmt.jpg",
  "Space Planning & Design": "solution-space-planning.jpg"
};
export {
  getIcon,
  iconMap,
  industryImages,
  solutionImages
};
