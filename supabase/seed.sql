-- ============================================================
-- AI Kids Academy — Seed Data
-- Run AFTER schema.sql and rls-policies.sql
--
-- This file populates:
--   1. science_experiments  (8 rows)
--   2. diy_projects         (8 rows)
--   3. engineering_challenges (8 rows)
--   4. discovery_missions   (8 rows)
--
-- These are read-only catalog tables — children reference them
-- by id in the progress table.
-- ============================================================

-- Use a transaction so the entire seed succeeds or rolls back
BEGIN;

-- ============================================================
-- 1. SCIENCE EXPERIMENTS (8 total)
-- ============================================================

-- Clear existing seed data (safe to re-run)
TRUNCATE science_experiments RESTART IDENTITY CASCADE;

INSERT INTO science_experiments
  (id, name, difficulty, age_minimum, time_minutes, xp_reward,
   materials, steps, safety_note, parent_supervision,
   science_concept, quiz_question, quiz_options, quiz_answer)
VALUES

('volcano',
 'Baking Soda Volcano',
 'easy', 9, 15, 60,
 ARRAY[
   'Baking soda (2 tbsp)',
   'White vinegar (half cup)',
   'Small bottle or cup',
   'Dish soap (a few drops)',
   'Food coloring (optional)',
   'Tray or plate'
 ],
 ARRAY[
   'Place your bottle on a tray to catch the mess.',
   'Add 2 tablespoons of baking soda into the bottle.',
   'Add a few drops of dish soap and food coloring.',
   'Slowly pour the vinegar into the bottle.',
   'Watch the eruption happen!',
   'Try adding more vinegar for a bigger reaction!'
 ],
 'Use a tray to catch spills. Vinegar is safe but can sting eyes. Ask an adult to help pour.',
 'Minimal supervision',
 'Acid-base reactions producing CO₂ gas — the same chemistry used in fire extinguishers!',
 'What gas is created when baking soda and vinegar mix?',
 ARRAY['Oxygen','Carbon Dioxide','Hydrogen','Nitrogen'],
 1),

('rainbow',
 'Rainbow Density Cup',
 'medium', 10, 20, 70,
 ARRAY[
   'Honey',
   'Dish soap',
   'Water with blue food coloring',
   'Vegetable oil',
   'Rubbing alcohol with red food coloring',
   'Tall clear glass',
   'Dropper or spoon'
 ],
 ARRAY[
   'Pour honey carefully into the bottom of the glass.',
   'Slowly add dish soap — pour down the side.',
   'Add blue-colored water very slowly.',
   'Add vegetable oil on top.',
   'Last, carefully add red alcohol on top.',
   'Watch the rainbow layers form! Do NOT stir.'
 ],
 'Ask a parent to help with rubbing alcohol. Do not drink any of the liquids.',
 'Parent should help with alcohol',
 'Liquid density — denser liquids sink below less dense ones regardless of color.',
 'Why do the liquids form separate layers?',
 ARRAY['They have different colors','They have different densities','They have different temperatures','They have different volumes'],
 1),

('battery',
 'Lemon Battery',
 'medium', 10, 25, 80,
 ARRAY[
   '2-3 fresh lemons',
   'Copper coins or copper wire',
   'Galvanized (zinc) nails',
   'Small LED light',
   'Connecting wires with clips'
 ],
 ARRAY[
   'Roll each lemon on a table to release the juice.',
   'Insert a copper coin halfway into each lemon.',
   'Insert a zinc nail into each lemon — not touching the copper.',
   'Connect lemons in series: copper of lemon 1 to zinc of lemon 2.',
   'Connect the ends to your LED. It should glow!'
 ],
 'Only use low-voltage LEDs. Never connect to wall outlets. This produces less than 3 volts — completely safe.',
 'Parent supervision recommended',
 'Electrochemical reactions — lemon juice acts as an electrolyte enabling electron flow between two different metals.',
 'What makes the lemon battery work?',
 ARRAY['The yellow color of the lemon','Lemon juice acts as electrolyte between two metals','Lemons store electricity naturally','The weight of the metals'],
 1),

('rocket',
 'Balloon Rocket',
 'easy', 9, 10, 50,
 ARRAY[
   'Long balloon',
   'String or fishing line (5+ meters)',
   'Straw',
   'Tape',
   'Two chairs or anchor points'
 ],
 ARRAY[
   'Tie one end of your string to a chair or door handle.',
   'Thread the string through the straw.',
   'Tie the other end to another chair — string must be tight and horizontal.',
   'Blow up the balloon but do NOT tie it.',
   'Tape the blown balloon to the straw while pinching the end closed.',
   'Let go and watch your rocket zoom!'
 ],
 'Make sure the path is clear before launching. Keep away from faces.',
 'Minimal supervision',
 'Newton''s Third Law of Motion — every action has an equal and opposite reaction, just like real rockets.',
 'Which law of physics makes the balloon rocket work?',
 ARRAY['Law of Gravity','Newton''s Third Law (action/reaction)','Law of Electricity','Archimedes'' Principle'],
 1),

('filter',
 'Water Filter Challenge',
 'hard', 11, 30, 90,
 ARRAY[
   'Plastic bottle (cut in half)',
   'Fine sand',
   'Coarse sand',
   'Small gravel or pebbles',
   'Cotton balls or coffee filter',
   'Muddy or dirty water',
   'Clean container to collect filtered water'
 ],
 ARRAY[
   'Cut the bottle in half. Use the top half upside down as your filter funnel.',
   'Place cotton balls or a coffee filter at the bottom (the neck).',
   'Add a layer of fine sand (about 3cm).',
   'Add coarse sand on top (3cm).',
   'Add a layer of small gravel (3cm).',
   'Pour dirty water slowly through the top.',
   'Compare the collected water to the original!'
 ],
 'Filtered water is NOT safe to drink. This is a science demonstration only!',
 'Parent supervision recommended',
 'Physical filtration — each layer catches different-sized particles, the same principle used in real water treatment plants.',
 'Why does filtered water still need chemicals added before drinking?',
 ARRAY['To add flavor','To kill bacteria and viruses too small for physical filters','To make it colder','To change the color'],
 1),

('raisins',
 'Dancing Raisins',
 'easy', 9, 10, 45,
 ARRAY[
   'Clear glass or jar',
   'Carbonated soda or sparkling water',
   'A handful of raisins'
 ],
 ARRAY[
   'Fill a clear glass with sparkling water or clear soda.',
   'Drop 5-6 raisins into the glass.',
   'Watch what happens!',
   'Observe the raisins going up and down.',
   'Time how long each raisin takes to go up and back.',
   'Try with grapes, small candies, or popcorn!'
 ],
 'Completely safe! Edible materials only.',
 'No supervision needed',
 'Buoyancy and carbonation — CO₂ bubbles attach to raisins, making them float, then pop at the surface, causing them to sink again.',
 'Why do raisins float up after sinking?',
 ARRAY['They absorb water and get lighter','CO₂ bubbles attach to them making them buoyant','They heat up and expand','The soda pushes them up'],
 1),

('ink',
 'Invisible Ink',
 'easy', 9, 15, 55,
 ARRAY[
   'Fresh lemon juice',
   'Small bowl',
   'Cotton swab or thin paintbrush',
   'White paper',
   'Lamp or warm surface (NOT a flame!)'
 ],
 ARRAY[
   'Squeeze fresh lemon juice into a bowl.',
   'Dip your cotton swab in the lemon juice.',
   'Write a secret message on white paper.',
   'Let the paper dry completely — the message disappears!',
   'Hold the paper near a lamp bulb (not touching) to warm it.',
   'Watch the secret message appear!'
 ],
 'Use a lamp bulb for heat — NEVER use a candle or open flame! Keep paper moving so it does not burn.',
 'Parent should supervise heating',
 'Oxidation — carbon compounds in lemon juice react with oxygen when heated, turning brown and revealing the message.',
 'What chemical process makes invisible ink appear when heated?',
 ARRAY['The lemon juice evaporates','Carbon compounds oxidize and turn brown','The paper changes color naturally','Lemon absorbs light when warm'],
 1),

('static',
 'Static Electricity Balloon',
 'easy', 9, 10, 45,
 ARRAY[
   'Inflated balloon',
   'Wool sweater or dry hair',
   'Thin stream of water from tap',
   'Small pieces of torn paper',
   'Empty aluminum can'
 ],
 ARRAY[
   'Blow up the balloon and tie it.',
   'Rub the balloon on your hair or a wool sweater for 30 seconds.',
   'Hold the charged balloon near small paper pieces — they jump!',
   'Turn on a thin stream of water from the tap.',
   'Hold the balloon near the water stream — watch it bend!',
   'Place an empty can on its side and hold the balloon near it — the can rolls!'
 ],
 'Completely safe static electricity only. No real electrical current involved.',
 'No supervision needed',
 'Static electricity — rubbing transfers electrons from hair to balloon, giving it a charge that attracts neutral objects.',
 'What happens to electrons when you rub a balloon on your hair?',
 ARRAY['Electrons move from balloon to hair','Electrons move from hair to balloon giving it a charge','Electrons are destroyed','Nothing happens to electrons'],
 1);

-- ============================================================
-- 2. DIY PROJECTS (8 total)
-- ============================================================

TRUNCATE diy_projects RESTART IDENTITY CASCADE;

INSERT INTO diy_projects
  (id, name, description, difficulty, time_minutes, skill_focus,
   skill_description, xp_reward, materials, steps, challenge)
VALUES

('phonestand',
 'Cardboard Phone Stand',
 'Build a functional stand that holds your phone or tablet upright!',
 'easy', 20, 'Engineering',
 'Engineering thinking, precise measurement, iterative design',
 50,
 ARRAY['Thick cardboard','Ruler','Pencil','Scissors','Tape or glue'],
 ARRAY[
   'Draw two identical L-shapes on cardboard (15cm tall, 10cm wide base).',
   'Cut them out carefully.',
   'Score and fold the base at 90 degrees.',
   'Cut a slot in each piece to interlock them together.',
   'Test your phone — adjust the slot for the right angle.',
   'Decorate with markers or stickers!'
 ],
 'Can you make it adjustable for 3 different angles?'),

('pencilorg',
 'Pencil Organizer',
 'Build a cool desk organizer from toilet paper rolls!',
 'easy', 25, 'Creativity',
 'Creativity, spatial planning, upcycling and reusing materials',
 45,
 ARRAY['4-6 toilet paper rolls','Cardboard base','Glue','Paint or washi tape','Scissors'],
 ARRAY[
   'Cut a cardboard base (about 20x15cm).',
   'Arrange your toilet rolls on the base in a design you like.',
   'Glue each roll to the base firmly.',
   'Let dry completely (30 minutes).',
   'Paint or decorate with tape and markers.',
   'Add your pens, pencils, and scissors!'
 ],
 'Add a small drawer using a matchbox for extra storage!'),

('bridge',
 'Paper Bridge Challenge',
 'Build a paper bridge that can hold real weight!',
 'hard', 45, 'Engineering',
 'Structural engineering, hypothesis testing, iteration and improvement',
 90,
 ARRAY['10 sheets of A4 paper','Tape','2 stacks of books (supports)','Coins for weight testing'],
 ARRAY[
   'Challenge: build a bridge from 10 sheets that holds 20 coins.',
   'Test idea 1: Fold paper into accordion/zigzag pleats for strength.',
   'Test idea 2: Roll paper into tubes — tubes are very strong!',
   'Span your bridge between the two book stacks.',
   'Add coins one by one. Record how many it holds.',
   'Redesign and try to beat your record!'
 ],
 'Can you hold 50 coins using only 10 sheets of paper?'),

('rbcar',
 'Rubber Band Car',
 'Build a small car that moves by rubber band energy!',
 'medium', 40, 'Mechanics',
 'Mechanical engineering, energy storage, cause-and-effect thinking',
 80,
 ARRAY['Small cardboard box','4 bottle caps (wheels)','2 wooden skewers','Rubber band','Tape','Pencil'],
 ARRAY[
   'Make 4 holes in the box sides — 2 on each side, aligned.',
   'Push skewers through as axles.',
   'Attach bottle caps to skewer ends as wheels (tape firmly).',
   'Tie a rubber band to the rear axle.',
   'Thread it through the box and attach to a pencil at the front.',
   'Wind the pencil to store energy in the rubber band.',
   'Place on floor and let go — it drives forward!'
 ],
 'Can you make it travel in a straight line for 2 meters?'),

('birdhouse',
 'Mini Birdhouse Concept',
 'Design a birdhouse like a real architect!',
 'easy', 30, 'Design',
 'Design thinking, technical drawing, research and planning skills',
 55,
 ARRAY['Large paper or cardboard','Colored pencils or markers','Ruler','Your imagination!'],
 ARRAY[
   'Research: what do birds need? (shelter, hole size, rain protection)',
   'Sketch the front view of your birdhouse.',
   'Draw the side view and top view.',
   'Label all dimensions (height, width, door hole size).',
   'Add labels: roof type, material, entrance hole, perch.',
   'Write a short paragraph explaining your design choices.',
   'Present it to a parent or sibling!'
 ],
 'What would you change to attract a specific bird species?'),

('robot',
 'Recycled Robot',
 'Build a cool robot sculpture from recycled materials!',
 'medium', 45, 'Creativity',
 'Creativity, recycling mindset, 3D spatial design and construction',
 70,
 ARRAY['Empty boxes and cans','Bottle caps and lids','Old CDs or foil','Tape and glue','Markers'],
 ARRAY[
   'Collect recycled materials for 2-3 days before starting.',
   'Design your robot on paper first — head, body, arms, legs.',
   'Build the body using your biggest box.',
   'Add a head box on top.',
   'Create arms from toilet rolls or paper.',
   'Add details: foil panels, cap buttons, CD screen.',
   'Give your robot a name and a special power!'
 ],
 'What real problem could your robot solve?'),

('visionboard',
 'Vision Board Poster',
 'Create a motivating poster of your dreams and goals!',
 'easy', 60, 'Goal Setting',
 'Goal setting, visualization, self-awareness and future planning',
 60,
 ARRAY['Large cardboard or poster board','Old magazines or printed images','Markers','Scissors','Glue stick'],
 ARRAY[
   'Think about your goals: What do you want to be? What do you want to do?',
   'Find or draw images that represent your goals.',
   'Categories: Career, Skills, Places, Things to create.',
   'Arrange everything on your board before gluing.',
   'Add inspiring words and your name.',
   'Glue everything and hang it where you see it every day!'
 ],
 'Show your vision board to your family and explain each item!'),

('boardgame',
 'Design a Board Game',
 'Create a complete original board game you can play with family!',
 'hard', 90, 'Systems Thinking',
 'Systems thinking, creativity, game design and writing skills',
 100,
 ARRAY['Large cardboard','Markers','Dice or paper dice template','Small objects as player tokens','Index cards'],
 ARRAY[
   'Decide your theme: space, jungle, underwater, school...',
   'Draw your game board with a path or zones.',
   'Write the rules: How do you win? How many players?',
   'Create event squares: Move forward 3, Lose a turn...',
   'Make 10 challenge cards with questions or dares.',
   'Create player tokens from folded cardboard.',
   'Test your game and improve the rules!',
   'Write the final rules on an index card.'
 ],
 'Teach someone else to play your game! Did they enjoy it?');

-- ============================================================
-- 3. ENGINEERING CHALLENGES (8 total)
-- ============================================================

TRUNCATE engineering_challenges RESTART IDENTITY CASCADE;

INSERT INTO engineering_challenges
  (id, name, goal, materials, rules,
   engineering_principle, design_thinking, testing_method,
   improvement_tips, skills, xp_reward)
VALUES

('tower',
 'Tallest Paper Tower',
 'Build the tallest freestanding tower using only 10 sheets of paper and tape.',
 ARRAY['10 sheets of A4 paper','Tape','Ruler','Timer (5 minutes)'],
 ARRAY[
   'Tower must stand alone for 10 seconds',
   'Only paper and tape allowed',
   'Measure from table to highest point'
 ],
 'Structural Engineering — triangles and cylinders are the strongest shapes in construction.',
 'Think about the base (wide = stable), middle (tubes for strength), and top (keep it light). Most teams fail by making the top too heavy.',
 'Measure height. Gently tap the table and see if it stays standing for 10 seconds.',
 'Try rolling paper into cylinders. Add triangular supports at the base. Test early and iterate.',
 ARRAY['Structural Engineering','Problem Solving','Iteration'],
 80),

('bridge',
 'Strongest Paper Bridge',
 'Build a bridge spanning 30cm that holds the most weight possible.',
 ARRAY['10 sheets of paper','Tape','2 stacks of books','Coins for weight testing'],
 ARRAY[
   'Bridge must span a 30cm gap between two book stacks',
   'Only paper and tape allowed',
   'Add coins one by one until it collapses'
 ],
 'Structural Engineering — compression, tension, and arch design distribute forces efficiently.',
 'Arches distribute weight sideways into the supports. Fold paper into accordion pleats for compressive strength. Corrugated layers are incredibly strong.',
 'Add coins one at a time. Record maximum weight before collapse. Try redesigning and beat your record.',
 'Add triangular truss structure underneath. Use corrugated (wavy) paper layers. Widen the deck.',
 ARRAY['Structural Engineering','Physics','Measurement'],
 90),

('eggdrop',
 'Egg Drop Design',
 'Design a container that protects an egg from a 1-meter drop. (Use a drawing — no real eggs needed!)',
 ARRAY['Paper and cardboard for design','Bubble wrap or cotton balls (optional)','String','Tape'],
 ARRAY[
   'Design on paper first — show all components',
   'Think about cushioning, parachute, and casing',
   'Present your design and explain the engineering reasoning'
 ],
 'Impact Engineering — energy absorption, force distribution, and crumple zones.',
 'Real egg drop devices use parachutes (slow descent), padding (absorb impact), and rigid outer casing (protect shape). Think like a car safety engineer!',
 'Draw your design. Label: where the egg sits, how it lands, what absorbs the impact, and why each layer matters.',
 'Add a parachute to slow descent. Use crumple zones inspired by real car crash safety engineering. Layer soft materials.',
 ARRAY['Engineering Design','Physics','Critical Thinking'],
 75),

('carwind',
 'Balloon-Powered Car',
 'Build a car powered only by a balloon that travels at least 50cm.',
 ARRAY['Small cardboard box','4 bottle caps','2 wooden skewers','Rubber band','Tape','Straw'],
 ARRAY[
   'Car must move at least 50cm on its own',
   'Only balloon power — no pushing or winding',
   'Test on a smooth flat floor'
 ],
 'Newton''s Third Law — air rushing backward creates an equal forward force, identical to jet engines.',
 'Wide wheel base means more stability. Straw directs air straight backward. Lighter car equals faster movement. Aligned wheels reduce friction.',
 'Mark start line. Release and measure distance. Time 3 runs and record the average.',
 'Lower the car body to reduce air resistance. Align all 4 wheels perfectly. Angle the straw directly backward.',
 ARRAY['Mechanical Engineering','Physics','Newton''s Laws'],
 80),

('marshmallow',
 'Marshmallow Tower',
 'Build the tallest freestanding structure using 20 spaghetti sticks and 1 marshmallow on top.',
 ARRAY['20 uncooked spaghetti sticks (or toothpicks)','1 meter of tape','1 marshmallow or small clay ball','Timer (18 minutes)'],
 ARRAY[
   'Must be freestanding — no leaning against anything',
   'Marshmallow must be on top',
   'No holding during final measurement',
   '18 minute strict time limit'
 ],
 'This is the world-famous Marshmallow Challenge used in design schools and business programs globally!',
 'Most teams fail because they put the marshmallow on at the very end — but it is heavier than expected! The secret: build the marshmallow into the structure from the very start. Test early and often.',
 'Measure from table surface to bottom of marshmallow. Must stand 5 seconds without support.',
 'Use triangles everywhere — they are the strongest shape. Prototype early. Put the marshmallow on within the first 2 minutes!',
 ARRAY['Design Thinking','Teamwork','Iteration'],
 85),

('catapult',
 'Catapult Builder',
 'Build a small catapult that launches a paper ball at least 1 meter.',
 ARRAY['Pencils or popsicle sticks','Rubber bands','Plastic spoon','Cardboard base','Small paper ball target'],
 ARRAY[
   'Catapult must sit on a stable base',
   'Launch a small paper ball at least 1 meter',
   'Measure the distance of 3 launches'
 ],
 'Mechanical Engineering — stored potential energy (stretched rubber band) converts to kinetic energy (projectile motion).',
 'The spoon acts as a lever. A longer throwing arm gives more distance. The rubber band stores energy. Release angle affects trajectory — experiment with 30°, 45°, and 60° angles.',
 'Test 3 times. Record each distance. Calculate the average. Try adjusting the launch angle between each test.',
 'Longer arm length increases distance. More rubber bands store more energy. Aim for 45° launch angle for maximum range.',
 ARRAY['Mechanical Engineering','Physics','Measurement'],
 80),

('waterchall',
 'Water Transport Challenge',
 'Move water from one cup to another 1 meter away without touching either cup.',
 ARRAY['2 cups','String, sponge, or paper towel','Water','Ruler and timer'],
 ARRAY[
   'Cannot touch or move either cup',
   'Cannot pour water directly',
   'Must transfer at least half the water',
   'Time yourself and try to beat your record'
 ],
 'Capillary action — water molecules cling to surfaces and to each other through cohesion and adhesion forces.',
 'A twisted string or thick rope can move water through capillary action. Different materials absorb water at different rates. Try cotton, wool, and paper towel.',
 'Time how long it takes to move half the water. Measure how much was transferred. Compare different materials.',
 'Thicker string moves more water faster. Wool performs better than cotton. Keep the string sloped slightly downward toward the target cup.',
 ARRAY['Science','Critical Thinking','Observation'],
 75),

('turbine',
 'Mini Wind Turbine Concept',
 'Design a wind turbine on paper that would generate electricity from wind.',
 ARRAY['Paper and pencil','Colored pencils','Ruler','Fan or breath for testing a paper pinwheel'],
 ARRAY[
   'Design the turbine with full labels',
   'Explain how it converts wind to electricity',
   'Make a paper pinwheel to test your blade design'
 ],
 'Wind Energy Engineering — kinetic energy of wind converts to rotational energy, which drives a generator to produce electricity.',
 'Blades must be angled like a propeller to catch wind efficiently. Three blades is the global standard — it balances efficiency with structural stability. Wider blades catch more wind but add weight.',
 'Make a paper pinwheel. Test blade angle in front of a fan: which angle spins fastest? Which stops in still air?',
 'Curved blades (like airplane wings) are more efficient than flat ones. Three blades beat two or four for balance. Tilt blades at about 45° for maximum capture.',
 ARRAY['Renewable Energy','Engineering Design','Systems Thinking'],
 70);

-- ============================================================
-- 4. DISCOVERY MISSIONS (8 total)
-- ============================================================

TRUNCATE discovery_missions RESTART IDENTITY CASCADE;

INSERT INTO discovery_missions
  (id, name, objective, instructions, difficulty, time_estimate,
   reflection_question, skills, xp_reward, requires_outdoors)
VALUES

('leaves',
 'Leaf Collection',
 'Find 3 different leaves and describe how they are different from each other.',
 ARRAY[
   'Go outside to your garden, park, or street.',
   'Collect 3 different leaves from different plants.',
   'Draw each leaf carefully and write: color, shape, size, edges (smooth or jagged).',
   'Try to find out what plant each leaf came from!',
   'Take photos or press the leaves in a book.'
 ],
 'easy', '30 minutes',
 'Why do you think leaves have different shapes? What job does each leaf shape do for the plant?',
 ARRAY['Observation','Biology','Curiosity'],
 50, TRUE),

('moon',
 'Moon Observer',
 'Observe and draw the Moon every evening for 5 days.',
 ARRAY[
   'Find the Moon in the sky each evening at the same time.',
   'Draw its exact shape in a notebook.',
   'Note the time and direction in the sky each day.',
   'After 5 days, arrange all drawings on one page.',
   'Try to predict what shape comes next!'
 ],
 'medium', '5 days (5 minutes/day)',
 'Why does the Moon look different each night? What pattern do you notice? Can you predict the next shape?',
 ARRAY['Astronomy','Observation','Pattern Recognition'],
 70, TRUE),

('engineering',
 'Engineering Spotter',
 'Find 3 examples of engineering or clever design around your home or neighborhood.',
 ARRAY[
   'Walk around your home or neighborhood.',
   'Find 3 things designed by engineers: bridges, ramps, water systems, buildings, roads.',
   'Photograph or sketch each one.',
   'For each: what problem does it solve? How does it work?',
   'Think about how you would redesign it better.'
 ],
 'easy', '1 hour',
 'What problem does each engineering design solve? Could you redesign any of them to work better or cost less?',
 ARRAY['Engineering','Observation','Critical Thinking'],
 55, TRUE),

('birds',
 'Bird Watcher',
 'Spot and identify at least 3 different bird species in your area.',
 ARRAY[
   'Sit quietly outside for 15-20 minutes.',
   'Watch for movement in trees and bushes. Stay still!',
   'Note each bird''s color, size, beak shape, and behavior.',
   'Try to find the bird''s name using a book, app, or online guide.',
   'Record each bird with a sketch or written description.'
 ],
 'medium', '1 week',
 'How were the birds different from each other? What were they eating or doing? Why do you think some birds are brightly colored?',
 ARRAY['Biology','Patience','Observation'],
 65, TRUE),

('clouds',
 'Cloud Detective',
 'Observe and identify 3 different types of clouds over 2 days.',
 ARRAY[
   'Look at the sky at different times of day over 2 days.',
   'Draw the cloud shapes you see.',
   'Learn the 3 main types: Cumulus (puffy), Stratus (flat layers), Cirrus (wispy/feathery).',
   'Record what the weather was like under each cloud type.',
   'Predict tomorrow''s weather from today''s clouds!'
 ],
 'easy', '2 days',
 'Did the cloud type predict the weather correctly? Which clouds bring rain? Which mean sunny weather?',
 ARRAY['Meteorology','Observation','Scientific Prediction'],
 50, FALSE),

('shadows',
 'Shadow Scientist',
 'Track how shadows change throughout the day and discover why.',
 ARRAY[
   'In the morning, place a stick or bottle in direct sunlight.',
   'Mark the shadow''s endpoint with a stone or piece of tape.',
   'Check again at noon and then in the afternoon.',
   'Measure the shadow length each time.',
   'Draw a diagram showing how the shadow moved throughout the day.'
 ],
 'easy', '1 full day',
 'Why does the shadow change? What direction does it move? What does this tell you about how the Earth moves relative to the Sun?',
 ARRAY['Astronomy','Measurement','Critical Thinking'],
 55, TRUE),

('recycling',
 'Recycling Detective',
 'Find 5 examples of recycling or sustainability practices around your home.',
 ARRAY[
   'Check the recycling bin — what materials are being recycled?',
   'Look for things made from recycled materials (check labels).',
   'Find examples of reuse: old jars used for storage, repurposed containers.',
   'Ask a family member what they do to reduce waste.',
   'Make a list of 3 things your family could start recycling better.'
 ],
 'easy', '1 day',
 'Why is recycling important? What would happen to our planet if nobody recycled? What is one change your family could make this week?',
 ARRAY['Environmental Science','Critical Thinking','Responsibility'],
 50, FALSE),

('water',
 'Water Cycle Watcher',
 'Observe evaporation and condensation happening in real life.',
 ARRAY[
   'Fill a glass with cold water and leave it outside on a warm day.',
   'Observe water droplets forming on the outside of the glass.',
   'Draw or photograph the droplets every 30 minutes.',
   'Take a wet cloth and leave it in the sun — time how long it takes to dry.',
   'Draw a simple water cycle diagram using what you observed.'
 ],
 'medium', '2 days',
 'Where do the outside droplets come from — are they from the water inside the glass? Where does the water go when the cloth dries? How does this connect to rain and clouds?',
 ARRAY['Science','Observation','Environmental Literacy'],
 60, FALSE);

-- ============================================================
-- VERIFY: Check all tables are populated
-- ============================================================

DO $$
DECLARE
  exp_count  INTEGER;
  diy_count  INTEGER;
  eng_count  INTEGER;
  disc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exp_count  FROM science_experiments;
  SELECT COUNT(*) INTO diy_count  FROM diy_projects;
  SELECT COUNT(*) INTO eng_count  FROM engineering_challenges;
  SELECT COUNT(*) INTO disc_count FROM discovery_missions;

  IF exp_count  <> 8 THEN RAISE EXCEPTION 'Expected 8 science experiments, got %', exp_count; END IF;
  IF diy_count  <> 8 THEN RAISE EXCEPTION 'Expected 8 DIY projects, got %', diy_count; END IF;
  IF eng_count  <> 8 THEN RAISE EXCEPTION 'Expected 8 engineering challenges, got %', eng_count; END IF;
  IF disc_count <> 8 THEN RAISE EXCEPTION 'Expected 8 discovery missions, got %', disc_count; END IF;

  RAISE NOTICE '✅ Seed verification passed: % experiments, % DIY, % engineering, % discovery',
    exp_count, diy_count, eng_count, disc_count;
END;
$$;

COMMIT;

-- ============================================================
-- Quick count check (run manually to verify after seeding)
-- ============================================================
-- SELECT 'science_experiments' AS table_name, COUNT(*) AS rows FROM science_experiments
-- UNION ALL SELECT 'diy_projects',            COUNT(*) FROM diy_projects
-- UNION ALL SELECT 'engineering_challenges',  COUNT(*) FROM engineering_challenges
-- UNION ALL SELECT 'discovery_missions',      COUNT(*) FROM discovery_missions;
