import { useEffect, useState } from "react";
import { getHello } from "../api/helloApi";

interface HelloProps {
  name: string;
}

export default function Hello({ name }: HelloProps) {
  const [msg, setMsg] = useState<string>("Chargement…");

  useEffect(() => {
    getHello()
      .then(setMsg)
      .catch((err) => {
        console.error(err);
        setMsg("Erreur de connexion");
      });
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-2">API Check</h1>
      <p className="text-lg mb-4">{msg}</p>
      <p className="text-lg">Utilisateur : <strong>{name}</strong></p>
    </div>
  );
}
