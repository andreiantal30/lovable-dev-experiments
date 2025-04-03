// src/lib/campaignEvents.ts

export const campaignEvents = {
    subscribe: (callback: () => void) => {
      window.addEventListener('campaign-updated', callback);
      return () => window.removeEventListener('campaign-updated', callback);
    },
    emit: () => {
      window.dispatchEvent(new Event('campaign-updated'));
    }
  };