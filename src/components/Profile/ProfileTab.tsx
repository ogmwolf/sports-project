"use client";
import { useApp } from "@/context/AppContext";
import ProfileCard from "./ProfileCard";
import PlayerDetails from "./PlayerDetails";
import HighlightReel from "./HighlightReel";
import Endorsements from "./Endorsements";

export default function ProfileTab() {
  const { athlete } = useApp();
  return (
    <div>
      <ProfileCard />
      <PlayerDetails athlete={athlete} />
      <HighlightReel athlete={athlete} />
      <Endorsements athlete={athlete} />
    </div>
  );
}
