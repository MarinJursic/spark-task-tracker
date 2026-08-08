import { useEffect, useState } from "react";

import type { TeamMember } from "../types";

const SESSION_MEMBER_KEY = "spark-active-member";

function readStoredMemberId(): number | null {
  const storedValue = window.sessionStorage.getItem(SESSION_MEMBER_KEY);
  const parsedValue = storedValue ? Number(storedValue) : NaN;
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export function useSessionMember(members: TeamMember[]) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(readStoredMemberId);
  const activeMemberId = members.some((member) => member.id === selectedMemberId)
    ? selectedMemberId
    : (members[0]?.id ?? null);

  useEffect(() => {
    if (activeMemberId !== null) {
      window.sessionStorage.setItem(SESSION_MEMBER_KEY, String(activeMemberId));
    }
  }, [activeMemberId]);

  const selectMember = (memberId: number) => {
    setSelectedMemberId(memberId);
    window.sessionStorage.setItem(SESSION_MEMBER_KEY, String(memberId));
  };

  return { activeMemberId, selectMember };
}
