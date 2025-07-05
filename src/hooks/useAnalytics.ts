// Simplified analytics hook without any tracking functionality
export const useAnalytics = () => {
  // Empty functions that do nothing but maintain compatibility
  const trackVideoPlay = () => {
    console.log('🎬 Video play event (tracking disabled)');
  };

  const trackVideoProgress = (currentTime: number, duration: number) => {
    console.log('📊 Video progress event (tracking disabled)', { currentTime, duration });
  };

  const trackOfferClick = (offerType: string) => {
    console.log('🛒 Offer click event (tracking disabled)', { offerType });
  };

  return {
    trackVideoPlay,
    trackVideoProgress,
    trackOfferClick,
  };
};