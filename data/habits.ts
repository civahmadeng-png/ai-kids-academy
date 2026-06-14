export const HABITS = [
  {id:'bed',   name:'Make my bed',      icon:'🛏️', xp:10},
  {id:'teeth', name:'Brush teeth',      icon:'🦷', xp:5},
  {id:'water', name:'Drink 8 glasses',  icon:'💧', xp:5},
  {id:'homework',name:'Finish homework',icon:'📝', xp:15},
  {id:'read',  name:'Read 15 minutes',  icon:'📖', xp:20},
  {id:'exercise',name:'Exercise',       icon:'🏃', xp:15},
  {id:'healthy',name:'Eat healthy food',icon:'🥗', xp:10},
  {id:'sleep', name:'Sleep on time',    icon:'😴', xp:10},
  {id:'room',  name:'Clean my room',    icon:'🧹', xp:10},
  {id:'parents',name:'Help parents',    icon:'❤️', xp:10},
  {id:'screen',name:'Limit screen time',icon:'📵', xp:15},
];

export const HABIT_CHARACTERS = [
  {emoji:'🐣',name:'Baby Chick',    req:0,   reqLabel:'Starting character!',    streakReq:0},
  {emoji:'🐥',name:'Little Hero',   req:10,  reqLabel:'10 habits done',         streakReq:0},
  {emoji:'🐓',name:'Brave Rooster', req:30,  reqLabel:'30 habits done',         streakReq:0},
  {emoji:'🦊',name:'Fox Explorer',  req:50,  reqLabel:'50 habits done',         streakReq:0},
  {emoji:'🦸',name:'Super Hero',    req:100, reqLabel:'100 habits done',        streakReq:0},
  {emoji:'🧙',name:'Habit Wizard',  req:200, reqLabel:'200 habits done',        streakReq:0},
  {emoji:'🦁',name:'Lion King',     req:0,   reqLabel:'7-day habit streak',     streakReq:7},
  {emoji:'🐉',name:'Dragon Master', req:0,   reqLabel:'30-day streak',          streakReq:30},
  {emoji:'🦄',name:'Unicorn Legend',req:0,   reqLabel:'All habits x 7 days',    streakReq:0, perfectWeek:true},
  {emoji:'⚡',name:'Lightning Hero', req:500, reqLabel:'500 habits done',        streakReq:0},
];
