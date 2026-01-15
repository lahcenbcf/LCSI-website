"use client";

import { createContext, useContext, useState } from "react";

interface ProfileStateContextType {
  profileCreated: boolean;
  notifyProfileCreated: () => void;
  resetProfileState: () => void;
}

const ProfileStateContext = createContext<ProfileStateContextType>({
  profileCreated: false,
  notifyProfileCreated: () => {},
  resetProfileState: () => {},
});

export function ProfileStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profileCreated, setProfileCreated] = useState(false);

  const notifyProfileCreated = () => {
    setProfileCreated(true);
  };

  const resetProfileState = () => {
    setProfileCreated(false);
  };

  return (
    <ProfileStateContext.Provider
      value={{
        profileCreated,
        notifyProfileCreated,
        resetProfileState,
      }}
    >
      {children}
    </ProfileStateContext.Provider>
  );
}

export const useProfileState = () => {
  const context = useContext(ProfileStateContext);
  if (!context) {
    throw new Error(
      "useProfileState must be used within a ProfileStateProvider"
    );
  }
  return context;
};
