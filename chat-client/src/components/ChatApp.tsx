// components/ChatApp.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import KeyPairDialog from "./KeyPairDialog";
import AcceptInviteDialog from "./AcceptInviteDialog";
import { getKeyPair, getInvites, clearDatabase } from "../services/localStorage";

export default function ChatApp() {
  const [step, setStep] = useState<"keyPair" | "invite" | "main">("keyPair");

  useEffect(() => {
    const initialize = async () => {
      const keyPair = await getKeyPair();
      const invites = await getInvites();

      if (!keyPair) {
        setStep("keyPair");
      } else if (invites.length === 0) {
        setStep("invite");
      } else {
        setStep("main");
      }
    };
    initialize();
  }, []);

  const handleClearDatabase = async () => {
    if (window.confirm("Are you sure you want to clear the database?")) {
      await clearDatabase();
      alert("Database cleared!");
      window.location.reload(); // Reload to reset app state
    }
  };

  return (
    <div>
      {/* Show the clear database button only in development mode */}
      {import.meta.env.MODE === "development" && (
        <ClearDatabaseButton onClick={handleClearDatabase}>
          Clear Database
        </ClearDatabaseButton>
      )}

      {/* Step-based rendering */}
      {step === "keyPair" && <KeyPairDialog onKeyPairReady={() => setStep("invite")} />}
      {step === "invite" && <AcceptInviteDialog onInviteAccepted={() => setStep("main")} />}
      {step === "main" && <div>Welcome to the Chat Application!</div>}
    </div>
  );
}

// Styled Clear Database Button
const ClearDatabaseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4d4f; /* Bright red for destructive action */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #d9363e; /* Darker red on hover */
  }

  &:active {
    background-color: #b71d22; /* Even darker red when clicked */
  }
`;
