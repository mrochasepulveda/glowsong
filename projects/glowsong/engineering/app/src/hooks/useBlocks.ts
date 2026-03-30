'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type BlockRow = {
  id: string;
  local_id: string;
  type: 'genre' | 'artist' | 'track';
  scope: 'permanent' | 'session';
  value: string;
  display_name: string;
  created_at: string;
};

type BlockInsert = Omit<BlockRow, 'id' | 'created_at'>;

interface UseBlocksReturn {
  blocks: BlockRow[];
  loading: boolean;
  error: string | null;
  addBlock: (data: Omit<BlockInsert, 'local_id'>) => Promise<void>;
  removeBlock: (blockId: string) => Promise<void>;
  refetch: () => void;
}

export function useBlocks(localId: string | null): UseBlocksReturn {
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    if (!localId) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase as any)
      .from('blocks')
      .select('*')
      .eq('local_id', localId)
      .order('created_at', { ascending: false });

    if (err) setError(err.message);
    else setBlocks((data ?? []) as BlockRow[]);
    setLoading(false);
  }, [localId]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const addBlock = async (data: Omit<BlockInsert, 'local_id'>) => {
    if (!localId) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newBlock, error: err } = await (supabase as any)
      .from('blocks')
      .insert({ ...data, local_id: localId })
      .select()
      .single();
    if (err) throw err;
    setBlocks((prev) => [newBlock as BlockRow, ...prev]);
  };

  const removeBlock = async (blockId: string) => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('blocks')
      .delete()
      .eq('id', blockId);
    if (err) throw err;
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  return { blocks, loading, error, addBlock, removeBlock, refetch: fetchBlocks };
}
