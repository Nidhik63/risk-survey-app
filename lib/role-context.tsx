"use client";

import { createContext, useContext } from "react";

export type UserRole = "surveyor" | "analyst";

const RoleContext = createContext<UserRole>("surveyor");

export function RoleProvider({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): UserRole {
  return useContext(RoleContext);
}
