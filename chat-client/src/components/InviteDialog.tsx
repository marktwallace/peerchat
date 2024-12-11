// components/InviteDialog.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { acceptInvite } from "../services/api";
import { getKeyPair } from "../services/localStorage";

interface InviteDialogProps {
  onInviteAccepted: (response: any) => void;
}

export default function InviteDialog({ onInviteAccepted }: InviteDialogProps) {
  const [inviteToken, setInviteToken] = useState("");
  const [publicKeyBase64, setPublicKeyBase64] = useState<string | null>(null);

  useEffect(() => {
    const loadKeyPair = async () => {
      const keyPair = await getKeyPair();
      if (keyPair) setPublicKeyBase64(keyPair.publicKey);
    };
    loadKeyPair();
  }, []);

  const handleAcceptInvite = async () => {
    if (!inviteToken) {
      alert("Please enter an invite token.");
      return;
    }

    if (!publicKeyBase64) {
      alert("A key pair is required to accept an invite. Please create one first.");
      return;
    }

    try {
      const response = await acceptInvite(inviteToken, publicKeyBase64);
      onInviteAccepted(response);
    } catch (error) {
      console.error("Failed to accept invite:", error);
      alert("Failed to accept invite.");
    }
  };

  return (
    <CenteredWrapper>
      <Modal>
        <Heading>Accept Invite</Heading>
        <Label>Invite Token:</Label>
        <TextArea
          placeholder="Enter invite token"
          value={inviteToken}
          onChange={(e) => setInviteToken(e.target.value)}
        />
        {publicKeyBase64 && (
          <>
            <Label>Your Public Key:</Label>
            <ReadOnlyTextArea value={publicKeyBase64} readOnly />
          </>
        )}
        <ButtonRow>
          <Button onClick={handleAcceptInvite}>Accept Invite</Button>
        </ButtonRow>
      </Modal>
    </CenteredWrapper>
  );
}

// Styled Components (reusing similar styles from KeyPairDialog)
const CenteredWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Modal = styled.div`
  padding: 1.5rem;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  color: #000;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 4rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #333;
  resize: none;
`;

const ReadOnlyTextArea = styled(TextArea)`
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
  pointer-events: none;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #003f7f;
  }
`;
