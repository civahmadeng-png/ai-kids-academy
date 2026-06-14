import type { Achievement } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  // Learning
  {icon:'🌟',name:'First Step',        desc:'Complete your first lesson',          earned:false,tier:'bronze'},
  {icon:'🔥',name:'On Fire',           desc:'7-day learning streak',               earned:false,tier:'silver'},
  {icon:'🧠',name:'AI Curious',        desc:'Finish AI Explorer Module 1',         earned:false,tier:'gold'},
  {icon:'✨',name:'Prompt Pro',        desc:'Complete 5 prompt challenges',        earned:false,tier:'silver'},
  {icon:'📚',name:'Knowledge Seeker',  desc:'Complete 20 lessons',                 earned:false,tier:'gold'},
  // Science
  {icon:'🧪',name:'First Experiment',  desc:'Complete your first experiment',      earned:false,tier:'bronze'},
  {icon:'🔬',name:'Mini Scientist',    desc:'Complete 3 experiments',              earned:false,tier:'silver'},
  {icon:'⚗️',name:'Lab Master',        desc:'Complete all 8 experiments',          earned:false,tier:'gold'},
  // Engineering
  {icon:'🔨',name:'First DIY Build',   desc:'Complete your first DIY project',     earned:false,tier:'bronze'},
  {icon:'🏗️',name:'Creative Builder',  desc:'Complete 3 DIY projects',             earned:false,tier:'silver'},
  {icon:'🛠️',name:'Maker Master',      desc:'Complete all 8 DIY projects',         earned:false,tier:'gold'},
  {icon:'⚙️',name:'Engineer',          desc:'Complete 5 engineering challenges',   earned:false,tier:'gold'},
  // Habits & Savings
  {icon:'💪',name:'Habit Hero',        desc:'7-day habit streak',                  earned:false,tier:'silver'},
  {icon:'🐷',name:'Super Saver',       desc:'Reach first savings goal',            earned:false,tier:'silver'},
  {icon:'💰',name:'Money Master',      desc:'Save $100 total',                     earned:false,tier:'gold'},
  // AI & Creativity
  {icon:'🎨',name:'Art Creator',       desc:'Create your first AI artwork',        earned:false,tier:'bronze'},
  {icon:'🤖',name:'Robot Friend',      desc:'Ask Sparky 50 questions',             earned:false,tier:'silver'},
  {icon:'🎬',name:'Story Creator',     desc:'Create your first story',             earned:false,tier:'bronze'},
  {icon:'📖',name:'Story Master',      desc:'Create 5 stories',                    earned:false,tier:'gold'},
  // Space & Discovery
  {icon:'🚀',name:'Space Explorer',    desc:'Explore all 8 space topics',          earned:false,tier:'gold'},
  {icon:'🌎',name:'Discovery Scout',   desc:'Complete 4 discovery missions',       earned:false,tier:'silver'},
  {icon:'🌟',name:'World Explorer',    desc:'Complete all discovery missions',     earned:false,tier:'gold'},
  // Career & Talent
  {icon:'🎭',name:'Talent Discovered', desc:'Complete the Talent Quiz',            earned:false,tier:'silver'},
  {icon:'🌟',name:'Career Explorer',   desc:'Explore 4 careers',                   earned:false,tier:'silver'},
  {icon:'🏆',name:'Career Master',     desc:'Explore all 8 careers',               earned:false,tier:'gold'},
  // Family
  {icon:'👨‍👩‍👧',name:'Family Mission',   desc:'Complete your first family mission',  earned:false,tier:'bronze'},
  {icon:'🏡',name:'Family Champion',   desc:'Complete 5 family missions',          earned:false,tier:'gold'},
  // City Builder
  {icon:'🏙️',name:'City Builder',      desc:'Unlock 4 city buildings',             earned:false,tier:'silver'},
  {icon:'🌆',name:'City Master',       desc:'Unlock all 8 city buildings',         earned:false,tier:'diamond'},
  // Milestones
  {icon:'🏆',name:'Quiz Champion',     desc:'Score 100% on 3 quizzes',             earned:false,tier:'gold'},
  {icon:'🗺️',name:'Map Explorer',      desc:'Visit every world on the map',        earned:false,tier:'silver'},
  {icon:'📸',name:'First Creation',    desc:'Submit your first creation photo',    earned:false,tier:'bronze'},
  {icon:'👑',name:'Academy Legend',    desc:'Complete all modules',                earned:false,tier:'legendary'},
];
