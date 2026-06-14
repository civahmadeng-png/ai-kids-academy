'use client';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';

// Lazy load all screens for performance
const HomeScreen       = dynamic(() => import('./HomeScreen'));
const ExplorerScreen   = dynamic(() => import('./ExplorerScreen'));
const HabitsScreen     = dynamic(() => import('./HabitsScreen'));
const SavingsScreen    = dynamic(() => import('./SavingsScreen'));
const AchievementsScreen = dynamic(() => import('./AchievementsScreen'));
const ParentScreen     = dynamic(() => import('./ParentScreen'));
const MentorScreen     = dynamic(() => import('./MentorScreen'));
const ScienceScreen    = dynamic(() => import('./ScienceScreen'));

// Dynamically import remaining screens
const PromptScreen     = dynamic(() => import('./PromptScreen'));
const ArtScreen        = dynamic(() => import('./ArtScreen'));
const WeeklyScreen     = dynamic(() => import('./WeeklyScreen'));
const SpaceScreen      = dynamic(() => import('./SpaceScreen'));
const EngineeringScreen= dynamic(() => import('./EngineeringScreen'));
const DiscoveryScreen  = dynamic(() => import('./DiscoveryScreen'));
const StoryScreen      = dynamic(() => import('./StoryScreen'));
const CareerScreen     = dynamic(() => import('./CareerScreen'));
const CityScreen       = dynamic(() => import('./CityScreen'));
const FamilyScreen     = dynamic(() => import('./FamilyScreen'));
const UpgradeScreen    = dynamic(() => import('./UpgradeScreen'));
const MapScreen        = dynamic(() => import('./MapScreen'));
const PetScreen        = dynamic(() => import('./PetScreen'));
const TalentScreen     = dynamic(() => import('./TalentScreen'));
const DIYScreen        = dynamic(() => import('./DIYScreen'));
const CreatorScreen    = dynamic(() => import('./CreatorScreen'));
const JourneysScreen   = dynamic(() => import('./JourneysScreen'));
const CameraScreen     = dynamic(() => import('./CameraScreen'));

export default function ScreenRouter() {
  const { currentScreen } = useAppStore();

  const screens: Record<string, React.ReactNode> = {
    home:         <HomeScreen />,
    explorer:     <ExplorerScreen />,
    prompt:       <PromptScreen />,
    art:          <ArtScreen />,
    weekly:       <WeeklyScreen />,
    space:        <SpaceScreen />,
    engineering:  <EngineeringScreen />,
    discovery:    <DiscoveryScreen />,
    habits:       <HabitsScreen />,
    savings:      <SavingsScreen />,
    mentor:       <MentorScreen />,
    achievements: <AchievementsScreen />,
    parent:       <ParentScreen />,
    science:      <ScienceScreen />,
    story:        <StoryScreen />,
    career:       <CareerScreen />,
    city:         <CityScreen />,
    family:       <FamilyScreen />,
    upgrade:      <UpgradeScreen />,
    map:          <MapScreen />,
    pet:          <PetScreen />,
    talent:       <TalentScreen />,
    diy:          <DIYScreen />,
    creator:      <CreatorScreen />,
    journeys:     <JourneysScreen />,
    camera:       <CameraScreen />,
  };

  return <>{screens[currentScreen] ?? <HomeScreen />}</>;
}
