import type { NavScreen } from '@/types';

export const NAV_ITEMS: NavScreen[] = [
  // Main
  {id:'home',       label:'Home',             icon:'🏠', section:'Main'},
  {id:'story',      label:'Story World',      icon:'📚', section:'Main', badge:'NEW', badgeColor:'#8B5CF6'},
  {id:'career',     label:'Career Center',    icon:'🌟', section:'Main'},
  {id:'city',       label:'STEM City',        icon:'🏙️', section:'Main'},
  {id:'family',     label:'Family Missions',  icon:'👨‍👩‍👧', section:'Main'},
  {id:'upgrade',    label:'Upgrade Plan',     icon:'⭐', section:'Main'},
  {id:'map',        label:'Adventure Map',    icon:'🗺️', section:'Main'},
  {id:'mentor',     label:'AI Mentor',        icon:'🤖', section:'Main', badge:'AI'},
  // Learn
  {id:'explorer',   label:'AI Explorer',      icon:'🧠', section:'Learn'},
  {id:'prompt',     label:'Prompt Master',    icon:'✨', section:'Learn'},
  {id:'art',        label:'Art Studio',       icon:'🎨', section:'Learn'},
  // New Worlds
  {id:'weekly',     label:'Weekly Challenges',icon:'🎯', section:'New Worlds', badge:'NEW'},
  {id:'space',      label:'Space Explorer',   icon:'🚀', section:'New Worlds'},
  {id:'engineering',label:'Engineering Lab',  icon:'⚙️', section:'New Worlds'},
  {id:'discovery',  label:'Discovery Missions',icon:'🌎',section:'New Worlds'},
  {id:'creator',    label:'Creator Studio',   icon:'🎬', section:'New Worlds'},
  {id:'journeys',   label:'Learning Journeys',icon:'🗺️', section:'New Worlds'},
  {id:'pet',        label:'My Pet',           icon:'🐾', section:'New Worlds'},
  // Explore
  {id:'science',    label:'Science Lab',      icon:'🧪', section:'Explore'},
  {id:'diy',        label:'DIY Creator',      icon:'🔨', section:'Explore'},
  {id:'talent',     label:'Talent Discovery', icon:'🎭', section:'Explore'},
  {id:'camera',     label:'My Creations',     icon:'📸', section:'Explore'},
  // Life Skills
  {id:'habits',     label:'Habit Hero',       icon:'💪', section:'Life Skills'},
  {id:'savings',    label:'Smart Savings',    icon:'🐷', section:'Life Skills'},
  // Progress
  {id:'achievements',label:'Achievements',   icon:'🏆', section:'Progress'},
  {id:'parent',     label:'Parent View',      icon:'👨‍👩‍👧', section:'Progress'},
];

export const SCREEN_TITLES: Record<string, string> = {
  home:'Welcome back!', map:'Adventure Map', mentor:'Ask Sparky',
  explorer:'AI Explorer', prompt:'Prompt Master', art:'AI Art Studio',
  weekly:'Weekly Challenges', space:'Space Explorer', engineering:'Engineering Lab',
  discovery:'Discovery Missions', creator:'Creator Studio', journeys:'Learning Journeys',
  pet:'My Pet', science:'Science Lab', diy:'DIY Creator', talent:'Talent Discovery',
  camera:'My Creations', habits:'Good Habits Hero', savings:'Smart Savings',
  achievements:'Achievements', parent:'Parent Dashboard',
  story:'AI Story World', career:'Career Discovery', city:'STEM City Builder',
  family:'Family Missions', upgrade:'Plans & Pricing',
};
