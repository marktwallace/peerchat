// components/KeyPairDialog.tsx
import React, { useState, useEffect } from "react";
import nacl from "tweetnacl";
import styled from "styled-components";
import {
  saveKeyPair,
  getKeyPair,
  deleteKeyPair,
} from "../services/localStorage";

interface KeyPairDialogProps {
  onKeyPairReady: () => void;
}

export default function KeyPairDialog({ onKeyPairReady }: KeyPairDialogProps) {
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);

  useEffect(() => {
    const fetchKeyPair = async () => {
      const existingKeyPair = await getKeyPair();
      if (existingKeyPair) setKeyPair(existingKeyPair);
    };
    fetchKeyPair();
  }, []);

  const handleGenerateKeys = async () => {
    const newKeyPair = nacl.sign.keyPair();
    const publicKey = btoa(String.fromCharCode(...newKeyPair.publicKey));
    const privateKey = btoa(String.fromCharCode(...newKeyPair.secretKey));

    console.log("Generated Key Pair:", { publicKey, privateKey });

    await saveKeyPair(publicKey, privateKey);
    setKeyPair({ publicKey, privateKey });
  };

  const handleDeleteKeys = async () => {
    await deleteKeyPair();
    setKeyPair(null);
  };

  return (
    <CenteredWrapper>
      <Modal>
        <Heading>Manage Your Key Pair</Heading>
        {keyPair ? (
          <KeyDisplay>
            <p>Public Key: {keyPair.publicKey}</p>
            <p>Private Key: {keyPair.privateKey}</p>
            <ButtonRow>
              <Button onClick={handleDeleteKeys}>Delete Key Pair</Button>
              <Button onClick={onKeyPairReady}>Continue</Button>
            </ButtonRow>
          </KeyDisplay>
        ) : (
          <Button onClick={handleGenerateKeys}>Generate Key Pair</Button>
        )}
      </Modal>
    </CenteredWrapper>
  );
}

const CenteredWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Full viewport height */
  background-color: #f5f5f5; /* Light background to soften the harsh contrast */
`;

const Modal = styled.div`
  padding: 1.5rem;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 8px;
  color: #000; /* Ensure text is visible */
  font-family: Arial, sans-serif; /* Use a basic fallback font */
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  color: #000;
  margin-bottom: 1rem;
`;

const KeyDisplay = styled.div`
  margin: 1rem 0;
  font-family: monospace;
  word-wrap: break-word;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  background-color: #007bff; /* Bootstrap-like primary blue */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3; /* Darker blue on hover */
  }

  &:active {
    background-color: #003f7f; /* Even darker on active */
  }
`;
