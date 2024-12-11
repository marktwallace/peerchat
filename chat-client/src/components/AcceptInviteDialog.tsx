// components/AcceptInviteDialog.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { saveInvite } from "../services/localStorage";
import { getKeyPair } from "../services/localStorage";

interface AcceptInviteDialogProps {
  onInviteAccepted: () => void;
}

export default function AcceptInviteDialog({ onInviteAccepted }: AcceptInviteDialogProps) {
  const [inviteToken, setInviteToken] = useState("");

  const handleAcceptInvite = async () => {
    const keyPair = await getKeyPair();
    if (!keyPair) {
      alert("You must generate a key pair before accepting an invite.");
      return;
    }

    if (!inviteToken) {
      alert("Please enter an invite token.");
      return;
    }

    try {
      // Save invite (simulate API call if needed)
      await saveInvite(inviteToken);
      onInviteAccepted();
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert("Failed to accept invite.");
    }
  };

  return (
    <Modal>
      <h2>Accept Invite</h2>
      <input
        type="text"
        placeholder="Enter invite token"
        value={inviteToken}
        onChange={(e) => setInviteToken(e.target.value)}
      />
      <button onClick={handleAcceptInvite}>Accept Invite</button>
    </Modal>
  );
}

const Modal = styled.div`
  padding: 1.5rem;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 8px;
`;
