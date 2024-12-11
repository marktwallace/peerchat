// components/InviteDialog.tsx
import React, { useState, useEffect } from "react";
import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { acceptInvite } from "../services/api";
import { savePublicKey, getPublicKey } from "../services/localStorage";
import styled from "styled-components";

interface InviteDialogProps {
  onInviteAccepted: (response: any) => void;
}

export default function InviteDialog({ onInviteAccepted }: InviteDialogProps) {
  const [inviteToken, setInviteToken] = useState("");
  const [publicKeyBase64, setPublicKeyBase64] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicKey = async () => {
      const savedKey = await getPublicKey();
      if (savedKey) setPublicKeyBase64(savedKey);
    };
    loadPublicKey();
  }, []);

  const handleGenerateKey = () => {
    const keyPair = nacl.sign.keyPair();
    const base64Key = Buffer.from(keyPair.publicKey).toString("base64");
    setPublicKeyBase64(base64Key);
    savePublicKey(base64Key); // Persist public key
  };

  const handleAcceptInvite = async () => {
    if (!inviteToken || !publicKeyBase64) {
      alert("Please provide an invite token and generate a key pair.");
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
    <Modal>
      <h2>Accept Invite</h2>
      <Input
        type="text"
        placeholder="Enter invite token"
        value={inviteToken}
        onChange={(e) => setInviteToken(e.target.value)}
      />
      <Button onClick={handleGenerateKey}>
        {publicKeyBase64 ? "Regenerate Key Pair" : "Generate Key Pair"}
      </Button>
      {publicKeyBase64 && (
        <KeyDisplay>
          <p>Your Public Key (Base64):</p>
          <code>{publicKeyBase64}</code>
        </KeyDisplay>
      )}
      <Button onClick={handleAcceptInvite}>Accept Invite</Button>
    </Modal>
  );
}

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  display: block;
  width: 100%;
  margin: 1rem 0;
  padding: 0.5rem;
`;

const Button = styled.button`
  margin-right: 1rem;
`;

const KeyDisplay = styled.div`
  margin-top: 1rem;
  font-family: monospace;
`;
