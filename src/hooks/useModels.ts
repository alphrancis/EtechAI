import { useState, useEffect } from "react";
import { fetchModels } from "@/services/api";
import type { Model } from "../types";

export function useModels(){
    const [models, setModels] = useState<Model[]>([]);
    const [selected, setSelected] = useState<Model | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>{
        fetchModels()
        .then((data) => {
            setModels(data);
            setSelected(data[0] ?? null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []); 

    return { models, selected, setSelected, loading, error };
}