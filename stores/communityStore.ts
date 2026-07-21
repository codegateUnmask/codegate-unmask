'use client';

import { create } from 'zustand';
import { MOCK_POSTS, type CommunityPost } from '@/lib/mock.community';

export interface NewPostInput {
  kind: CommunityPost['kind'];
  title: string;
  body: string;
  docTypeTag?: string;
}

interface CommunityState {
  posts: CommunityPost[];
  addPost: (input: NewPostInput) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: MOCK_POSTS,
  addPost: (input) =>
    set((state) => ({
      posts: [
        {
          ...input,
          id: crypto.randomUUID(),
          author: '데모 사용자',
          createdAt: '방금 전',
          likes: 0,
          comments: [],
        },
        ...state.posts,
      ],
    })),
}));
