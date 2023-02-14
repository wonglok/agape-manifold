import { create } from 'zustand'

export const hookWow = create((set, get) => {
  return {
    //
    progress: 0,
    ply: false,
  }
})
