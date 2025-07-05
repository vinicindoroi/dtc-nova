import React, { useState, useEffect } from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { initializeRedTrack } from './utils/redtrackIntegration';

// Import all components
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { VideoSection } from './components/VideoSection';
import { ProductOffers } from './components/ProductOffers';
import { TestimonialsSection } from './components/TestimonialsSection';
import { DoctorsSection } from './components/DoctorsSection';
import { NewsSection } from './components/NewsSection';
import { GuaranteeSection } from './components/GuaranteeSection';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';

function App() {
  const [showPurchaseButton, setShowPurchaseButton] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');

  // Global error handler to prevent white page
  useEffect(() => {
    const handleGlobalError = (event: Event | ErrorEvent) => {
      const errorEvent = event as ErrorEvent;
      
      console.error('🚨 Global error caught:', errorEvent.error || errorEvent.message);
      
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.bottom = '10px';
      errorDiv.style.right = '10px';
      errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
      errorDiv.style.color = 'white';
      errorDiv.style.padding = '8px 12px';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.fontSize = '12px';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.maxWidth = '300px';
      errorDiv.textContent = 'Ocorreu um erro, mas estamos trabalhando para corrigir.';
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
      
      document.body.appendChild(errorDiv);
      
      return true;
    };
    
    window.addEventListener('error', handleGlobalError);
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    });
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  const { trackVideoPlay, trackVideoProgress, trackOfferClick } = useAnalytics();

  useEffect(() => {
    const initializeUrlTracking = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const trackingParams: Record<string, string> = {};
        
        const trackingKeys = [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
          'fbclid', 'gclid', 'ttclid', 'twclid', 'li_fat_id',
          'affiliate_id', 'sub_id', 'click_id', 'transaction_id'
        ];
        
        trackingKeys.forEach(key => {
          const value = urlParams.get(key);
          if (value) {
            trackingParams[key] = value;
          }
        });
        
        if (Object.keys(trackingParams).length > 0) {
          sessionStorage.setItem('tracking_params', JSON.stringify(trackingParams));
        }
        
        // External pixel tracking
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'PageView');
        }
        
        if (typeof window !== 'undefined' && (window as any).utmify) {
          (window as any).utmify('track', 'PageView');
        }
      } catch (error) {
        console.error('Error initializing URL tracking:', error);
      }
    };

    initializeUrlTracking();
    initializeRedTrack();
    
    const injectVTurbScript = () => {
      if (window.vslVideoLoaded && document.getElementById('vid_683ba3d1b87ae17c6e07e7db')?.querySelector('video')) {
        console.log('🛡️ VTurb script already loaded, skipping injection');
        return;
      }

      const existingScript = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'scr_683ba3d1b87ae17c6e07e7db';
      script.async = true;
      script.defer = true;
      
      script.innerHTML = `
        (function() {
          try {
            window.mainVideoId = '683ba3d1b87ae17c6e07e7db';
            window.smartplayer = window.smartplayer || { instances: {} };
            console.log('🎬 Initializing MAIN video player: 683ba3d1b87ae17c6e07e7db');

            if (document.querySelector('script[src*="683ba3d1b87ae17c6e07e7db/player.js"]')) {
              console.log('🛡️ VTurb script already in DOM, skipping duplicate injection');
              window.vslVideoLoaded = true;
              return;
            }
            
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/player.js";
            s.async = true;
            s.onload = function() {
              console.log('VTurb player script loaded successfully');
              window.vslVideoLoaded = true;
              
              setTimeout(function() {
                try {
                  if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances['683ba3d1b87ae17c6e07e7db']) {
                    var player = window.smartplayer.instances['683ba3d1b87ae17c6e07e7db'];
                    if (player.play) {
                      player.play();
                      console.log('✅ Auto-play via smartplayer instance');
                    }
                  }
                  
                  var videoElements = document.querySelectorAll('#vid_683ba3d1b87ae17c6e07e7db video');
                  videoElements.forEach(function(video) {
                    if (video.play) {
                      video.play().then(function() {
                        console.log('✅ Auto-play via video element');
                      }).catch(function(error) {
                        console.log('⚠️ Auto-play blocked by browser:', error);
                      });
                    }
                  });
                  
                  var container = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                  if (container) {
                    container.click();
                    console.log('✅ Auto-play via container click');
                  }
                } catch (error) {
                  console.log('⚠️ Auto-play failed:', error);
                }
              }, 3000);
              
              setTimeout(function() {
                var mainContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                if (mainContainer) {
                  console.log('✅ Main video container secured');
                  mainContainer.setAttribute('data-main-video', 'true');
                }
              }, 2000);
            };
            s.onerror = function() {
              console.error('Failed to load VTurb player script');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
    };

    const scriptTimeout = setTimeout(() => {
      injectVTurbScript();
      
      const checkVideoLoaded = () => {
        const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        if (videoContainer && (videoContainer.querySelector('video') || window.vslVideoLoaded)) {
          setIsVideoLoaded(true);
          console.log('✅ Video container has video element, marking as loaded');
        }
      };
      
      checkVideoLoaded();
      const videoCheckInterval = setInterval(checkVideoLoaded, 1000);
      
      setTimeout(() => {
        clearInterval(videoCheckInterval);
        setIsVideoLoaded(true);
      }, 15000);
      
      return () => {
        clearInterval(videoCheckInterval);
      };
    }, 500);

    return () => {
      clearTimeout(scriptTimeout);
      const scriptToRemove = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  const handleSecondaryPackageClick = (packageType: '1-bottle' | '3-bottle') => {
    setSelectedPackage(packageType);
    setShowUpsellPopup(true);
  };

  const closeUpsellPopup = () => {
    setShowUpsellPopup(false);
    setSelectedPackage('');
  };

  const getUpsellSavings = (packageType: string) => {
    if (packageType === '3-bottle') {
      return 102;
    } else if (packageType === '1-bottle') {
      return 240;
    }
    return 0;
  };

  const handlePurchase = (packageType: '1-bottle' | '3-bottle' | '6-bottle') => {
    trackOfferClick(packageType);
    
    const links = {
      '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
      '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1',
      '6-bottle': 'https://pagamento.paybluedrops.com/checkout/176849703:1'
    };
    
    window.location.href = links[packageType];
  };

  const handleUpsellAccept = () => {
    handlePurchase('6-bottle');
    closeUpsellPopup();
  };

  const handleUpsellRefuse = () => {
    if (selectedPackage) {
      handlePurchase(selectedPackage as '1-bottle' | '3-bottle' | '6-bottle');
    }
    closeUpsellPopup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-x-hidden">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-full">
        
        <Header />

        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          
          <HeroSection />

          <VideoSection />

          <ProductOffers 
            showPurchaseButton={showPurchaseButton}
            onPurchase={handlePurchase}
            onSecondaryPackageClick={handleSecondaryPackageClick}
          />
        </div>

        <TestimonialsSection />

        <DoctorsSection />

        <NewsSection />

        <GuaranteeSection />

        <section 
          id="final-purchase-section"
          data-purchase-section="true"
          className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-2200"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-4">
              <span className="block">Ready to Transform</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Your Life?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-700 font-semibold mb-2">
              Choose your BlueDrops package below
            </p>
            <p className="text-sm sm:text-base text-blue-600">
              Don't miss this opportunity to transform your health and confidence
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ProductOffers 
                showPurchaseButton={true}
                onPurchase={handlePurchase}
                onSecondaryPackageClick={handleSecondaryPackageClick}
              />
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3">
                🚀 Your Transformation Starts Today
              </h3>
              <p className="text-blue-700 text-sm sm:text-base leading-relaxed">
                Join thousands of men who have already discovered the power of BlueDrops. 
                With our 180-day guarantee, you have nothing to lose and everything to gain.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <Modals 
        showPopup={false}
        showUpsellPopup={showUpsellPopup}
        selectedPackage={selectedPackage}
        onClosePopup={() => {}}
        onCloseUpsellPopup={closeUpsellPopup}
        onUpsellAccept={handleUpsellAccept}
        onUpsellRefuse={handleUpsellRefuse}
        getUpsellSavings={getUpsellSavings}
      />
    </div>
  );
}

declare global {
  interface Window {
    smartplayer?: {
      instances?: {
        [key: string]: {
          on: (event: string, callback: (event?: any) => void) => void;
          play?: () => void;
          pause?: () => void;
          getCurrentTime?: () => number;
          getDuration?: () => number;
        };
      };
    };
    vslVideoLoaded?: boolean;
    vslCustomElementsRegistered?: boolean;
    pixelId?: string;
  }
}

export default App;