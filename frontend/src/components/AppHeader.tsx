import { UserRound } from "lucide-react";

import type { TeamMember } from "../types";

interface AppHeaderProps {
  members: TeamMember[];
  activeMemberId: number | null;
  onMemberChange: (memberId: number) => void;
}

export function AppHeader({ members, activeMemberId, onMemberChange }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand" aria-label="Spark Team Tasks">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-copy">
            <strong>SPARK</strong>
            <small>TUTORING · TEAM TASKS</small>
          </span>
        </div>
        <label className="session-user">
          <UserRound size={17} aria-hidden="true" />
          <span>Working as</span>
          <select
            aria-label="Active session user"
            disabled={members.length === 0}
            value={activeMemberId ?? ""}
            onChange={(event) => onMemberChange(Number(event.target.value))}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
