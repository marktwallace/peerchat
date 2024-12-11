// components/KeyPairDialog.tsx
import React, { useState, useEffect } from "react";
import nacl from "tweetnacl";
import styled from "styled-components";
import { saveKeyPair, getKeyPair, deleteKeyPair } from "../services/localStorage";
import { validateEd25519Keys } from "../utils/validation";

interface KeyPairDialogProps {
  onKeyPairReady: () => void;
}

export default function KeyPairDialog({ onKeyPairReady }: KeyPairDialogProps) {
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    const fetchKeyPair = async () => {
      const existingKeyPair = await getKeyPair();
      if (existingKeyPair) {
        setKeyPair(existingKeyPair);
        setPublicKey(existingKeyPair.publicKey);
        setPrivateKey(existingKeyPair.privateKey);
      }
    };
    fetchKeyPair();
  }, []);

  const handleGenerateKeys = () => {
    const newKeyPair = nacl.sign.keyPair();
    const generatedPublicKey = btoa(String.fromCharCode(...newKeyPair.publicKey));
    const generatedPrivateKey = btoa(String.fromCharCode(...newKeyPair.secretKey));
    setPublicKey(generatedPublicKey);
    setPrivateKey(generatedPrivateKey);
  };

  const handleSaveKeys = async () => {
    if (!publicKey || !privateKey) {
      alert("Both Public Key and Private Key fields must be filled in.");
      return;
    }
  
    if (!validateEd25519Keys(publicKey, privateKey)) {
      alert("Invalid key pair. Please ensure the keys are valid Ed25519 keys and match.");
      return;
    }
  
    await saveKeyPair(publicKey, privateKey);
    setKeyPair({ publicKey, privateKey });
    alert("Key pair saved successfully!");
  };
  
  const handleDeleteKeys = async () => {
    await deleteKeyPair();
    setKeyPair(null);
    setPublicKey("");
    setPrivateKey("");
  };

  return (
    <CenteredWrapper>
      <Modal>
        <Heading>Manage Your Key Pair</Heading>

        {keyPair ? (
          <>
            <Label>Public Key:</Label>
            <ReadOnlyTextArea value={keyPair.publicKey} readOnly />
            <Label>Private Key:</Label>
            <ReadOnlyTextArea value={keyPair.privateKey} readOnly />
            <ButtonRow>
              <Button onClick={handleDeleteKeys}>Delete Key Pair</Button>
              <Button onClick={onKeyPairReady}>Continue</Button>
            </ButtonRow>
          </>
        ) : (
          <>
            <Label>Public Key:</Label>
            <TextArea
              placeholder="Paste your public key here"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <Label>Private Key:</Label>
            <TextArea
              placeholder="Paste your private key here"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <ButtonRow>
              <Button onClick={handleGenerateKeys}>Generate Keys</Button>
              <Button onClick={handleSaveKeys}>Save Key Pair</Button>
            </ButtonRow>
          </>
        )}
      </Modal>
    </CenteredWrapper>
  );
}

// Styled Components
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
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
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
