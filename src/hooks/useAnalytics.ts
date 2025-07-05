import { useEffect, useRef } from 'react';

interface GeolocationData {
  ip: string;
  country_code: string;
  country_name: string;
  city: string;
  region: string;
}

interface AnalyticsEvent {
  sessionId: string;
  eventType: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
  eventData: any;
  timestamp: string;
  geolocation?: GeolocationData;
}

export const useAnalytics = () => {
  const sessionId = useRef<string>(generateSessionId());
  const pageEnterTime = useRef<number>(Date.now());
  const hasTrackedVideoPlay = useRef<boolean>(false);
  const hasTrackedLeadReached = useRef<boolean>(false);
  const hasTrackedPitchReached = useRef<boolean>(false);
  const geolocationData = useRef<GeolocationData | null>(null);
  const isGeolocationLoaded = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);
  const pageExitTracked = useRef<boolean>(false);
  const isBrazilianIP = useRef<boolean>(false);
  const pageStartTime = useRef<number>(Date.now());

  function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Function to get geolocation data with multiple stable APIs and fallbacks
  const getGeolocationData = async (): Promise<GeolocationData> => {
    // Check if we already have the data in sessionStorage
    const cachedData = sessionStorage.getItem('geolocation_data');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        console.log('Using cached geolocation data:', parsed);
        
        if (parsed.country_code === 'BR' || parsed.country_name === 'Brazil') {
          isBrazilianIP.current = true;
          console.log('🇧🇷 Brazilian IP detected - analytics tracking will be skipped');
        }
        
        return parsed;
      } catch (error) {
        console.error('Error parsing cached geolocation data:', error);
      }
    }

    // Skip geolocation in development/preview environments
    if (window.location.hostname.includes("local") || 
        window.location.hostname.includes("preview") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("127.0.0.1")) {
      const devData: GeolocationData = {
        ip: "127.0.0.1",
        country_code: "US",
        country_name: "United States",
        city: "New York",
        region: "New York"
      };
      sessionStorage.setItem('geolocation_data', JSON.stringify(devData));
      console.log('Using development fallback data:', devData);
      return devData;
    }

    // Default fallback data
    const defaultData: GeolocationData = {
      ip: 'Unknown',
      country_code: 'XX',
      country_name: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };

    // Multiple stable geolocation services with proper data mapping
    const services = [
      {
        url: 'https://ipwhois.app/json/',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code || 'XX',
          country_name: data.country || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      },
      {
        url: 'https://ipinfo.io/json?token=demo',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country || 'XX',
          country_name: data.country || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      },
      {
        url: 'https://ipapi.co/json/',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code || 'XX',
          country_name: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      }
    ];

    for (const service of services) {
      try {
        console.log(`Trying geolocation service: ${service.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Analytics/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Geolocation API response from ${service.url}:`, data);
        
        const geolocation = service.mapper(data);

        // Validate that we got meaningful data
        if (geolocation.ip && geolocation.ip !== 'Unknown' && 
            geolocation.country_name && geolocation.country_name !== 'Unknown') {
          
          if (geolocation.country_code === 'BR' || geolocation.country_name === 'Brazil') {
            isBrazilianIP.current = true;
            console.log('🇧🇷 Brazilian IP detected - analytics tracking will be skipped');
          }
          
          sessionStorage.setItem('geolocation_data', JSON.stringify(geolocation));
          console.log('Successfully obtained geolocation data:', geolocation);
          
          return geolocation;
        } else {
          console.warn(`Service ${service.url} returned incomplete data:`, geolocation);
          continue;
        }
        
      } catch (error) {
        console.error(`Error with geolocation service ${service.url}:`, error);
        continue;
      }
    }

    // If all services fail, try to get basic browser info
    try {
      const browserLang = navigator.language || 'en-US';
      const countryFromLang = browserLang.split('-')[1] || 'XX';
      
      const browserData = {
        ...defaultData,
        ip: `Browser-${Date.now()}`,
        country_code: countryFromLang,
        country_name: getCountryNameFromCode(countryFromLang),
        city: 'Browser Location',
        region: 'Browser Region'
      };
      
      if (browserData.country_code === 'BR' || browserData.country_name === 'Brazil') {
        isBrazilianIP.current = true;
        console.log('🇧🇷 Brazilian IP detected via browser - analytics tracking will be skipped');
      }
      
      sessionStorage.setItem('geolocation_data', JSON.stringify(browserData));
      console.log('Using browser-based fallback data:', browserData);
      return browserData;
    } catch (error) {
      console.error('Error getting browser data:', error);
    }

    console.log('Using default fallback data:', defaultData);
    sessionStorage.setItem('geolocation_data', JSON.stringify(defaultData));
    return defaultData;
  };

  // Helper function to get country name from country code
  const getCountryNameFromCode = (code: string): string => {
    const countryMap: { [key: string]: string } = {
      'BR': 'Brazil',
      'US': 'United States',
      'PT': 'Portugal',
      'ES': 'Spain',
      'AR': 'Argentina',
      'MX': 'Mexico',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
      'IT': 'Italy',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'AU': 'Australia',
      'RU': 'Russia',
      'KR': 'South Korea',
      'NL': 'Netherlands'
    };
    return countryMap[code.toUpperCase()] || 'Unknown';
  };

  // Local storage for analytics events
  const storeEventLocally = (event: AnalyticsEvent) => {
    try {
      const existingEvents = localStorage.getItem('analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      events.push(event);
      
      // Keep only last 100 events to prevent storage overflow
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
      console.log('📊 Event stored locally:', event.eventType);
    } catch (error) {
      console.error('Error storing event locally:', error);
    }
  };

  const trackEvent = async (
    eventType: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit',
    eventData?: any
  ) => {
    if (eventType === 'page_exit' && pageExitTracked.current) {
      console.log('🛑 Page exit already tracked, skipping duplicate');
      return;
    }
    
    if (eventType === 'page_exit') {
      pageExitTracked.current = true;
    }
    
    try {
      console.log(`📊 TRACKING EVENT: ${eventType}`, eventData);
      
      // Wait for geolocation data if not loaded yet
      if (!isGeolocationLoaded.current) {
        geolocationData.current = await getGeolocationData();
        isGeolocationLoaded.current = true;
      }

      // Skip tracking for Brazilian IPs
      if (isBrazilianIP.current) {
        console.log('🇧🇷 Skipping analytics tracking for Brazilian IP');
        return;
      }

      // Include geolocation data in event
      const enrichedEventData = {
        ...eventData,
        country: geolocationData.current?.country_name || 'Unknown'
      };

      const analyticsEvent: AnalyticsEvent = {
        sessionId: sessionId.current,
        eventType,
        eventData: enrichedEventData,
        timestamp: new Date().toISOString(),
        geolocation: geolocationData.current || undefined
      };

      // Store event locally instead of sending to Supabase
      storeEventLocally(analyticsEvent);

      // Track with external pixels
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('trackCustom', `VSL_${eventType}`, enrichedEventData);
      }
      
      if (typeof window !== 'undefined' && (window as any).utmify) {
        (window as any).utmify('track', eventType, enrichedEventData);
      }

      console.log(`✅ SUCESSO - Event tracked locally: ${eventType}`, enrichedEventData);
    } catch (error) {
      console.error(`❌ ERRO ao tracking event ${eventType}:`, error);
    }
  };

  // Track page enter on mount
  useEffect(() => {
    if (isInitialized.current) {
      console.log('🔄 Analytics already initialized, skipping');
      return;
    }
    isInitialized.current = true;
    pageStartTime.current = Date.now();

    const initializeAnalytics = async () => {
      try {
        geolocationData.current = await getGeolocationData();
        isGeolocationLoaded.current = true;
        
        if (!isBrazilianIP.current) {
          await trackEvent('page_enter', { 
            page_start_time: pageStartTime.current,
            country: geolocationData.current?.country_name || 'Unknown',
            city: geolocationData.current?.city || 'Unknown',
            region: geolocationData.current?.region || 'Unknown'
          });
        } else {
          console.log('🇧🇷 Brazilian IP detected - skipping page_enter tracking');
        }
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
    };

    initializeAnalytics();

    return () => {
      try {
        if (!isBrazilianIP.current && !pageExitTracked.current) {
          const timeOnPage = Date.now() - pageEnterTime.current;
          const totalTimeOnPage = Date.now() - pageStartTime.current;
          trackEvent('page_exit', { 
            time_on_page_ms: timeOnPage,
            total_time_on_page_ms: totalTimeOnPage,
            country: geolocationData.current?.country_name || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error tracking page exit:', error);
      }
    };
  }, []);

  // Handle beforeunload to track page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (!isBrazilianIP.current && !pageExitTracked.current) {
          const timeOnPage = Date.now() - pageEnterTime.current;
          const totalTimeOnPage = Date.now() - pageStartTime.current;
          
          const data = { 
            time_on_page_ms: timeOnPage,
            total_time_on_page_ms: totalTimeOnPage,
            country: geolocationData.current?.country_name || 'Unknown'
          };
          
          pageExitTracked.current = true;
          
          // Store locally for beforeunload
          const event: AnalyticsEvent = {
            sessionId: sessionId.current,
            eventType: 'page_exit',
            eventData: data,
            timestamp: new Date().toISOString(),
            geolocation: geolocationData.current || undefined
          };
          
          try {
            const existingEvents = localStorage.getItem('analytics_events');
            const events = existingEvents ? JSON.parse(existingEvents) : [];
            events.push(event);
            localStorage.setItem('analytics_events', JSON.stringify(events));
          } catch (error) {
            console.error('Error storing exit event:', error);
          }
          
          console.log('📤 Page exit tracked locally');
        }
      } catch (error) {
        console.error('Error in beforeunload handler:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const trackVideoPlay = () => {
    if (isBrazilianIP.current) return;
    
    if (!hasTrackedVideoPlay.current) {
      hasTrackedVideoPlay.current = true;
      console.log('🎬 TRACKING VIDEO PLAY (VTurb loaded successfully)');
      trackEvent('video_play', { 
        country: geolocationData.current?.country_name || 'Unknown',
        vturb_loaded: true,
        video_container_id: '683ba3d1b87ae17c6e07e7db',
        timestamp: Date.now()
      });
    } else {
      console.log('⚠️ Video play já foi tracked para esta sessão');
    }
  };

  const trackVideoProgress = (currentTime: number, duration: number) => {
    if (isBrazilianIP.current) return;
    
    const totalTimeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    if (totalTimeOnPage >= 2155 && !hasTrackedPitchReached.current) {
      hasTrackedPitchReached.current = true;
      trackEvent('pitch_reached', { 
        milestone: 'pitch_reached_35_55',
        time_reached: totalTimeOnPage,
        total_time_on_page: totalTimeOnPage,
        actual_video_time: currentTime,
        country: geolocationData.current?.country_name || 'Unknown'
      });
      console.log('🎯 User has been on page for 35:55 (2155 seconds) - pitch moment reached');
      
      setTimeout(() => {
        scrollToPurchaseButton();
      }, 1000);
    }
    
    if (totalTimeOnPage >= 465 && !hasTrackedLeadReached.current) {
      hasTrackedLeadReached.current = true;
      trackEvent('video_progress', { 
        milestone: 'lead_reached',
        time_reached: totalTimeOnPage,
        total_time_on_page: totalTimeOnPage,
        actual_video_time: currentTime,
        country: geolocationData.current?.country_name || 'Unknown'
      });
    }
    
    const progressPercent = (currentTime / duration) * 100;
    
    const milestone25 = Math.floor(duration * 0.25);
    const milestone50 = Math.floor(duration * 0.50);
    const milestone75 = Math.floor(duration * 0.75);

    if (currentTime >= milestone25 && currentTime < milestone50) {
      trackEvent('video_progress', { 
        progress: 25, 
        actual_video_time: currentTime,
        total_time_on_page: totalTimeOnPage,
        country: geolocationData.current?.country_name || 'Unknown'
      });
    } else if (currentTime >= milestone50 && currentTime < milestone75) {
      trackEvent('video_progress', { 
        progress: 50, 
        actual_video_time: currentTime,
        total_time_on_page: totalTimeOnPage,
        country: geolocationData.current?.country_name || 'Unknown'
      });
    } else if (currentTime >= milestone75) {
      trackEvent('video_progress', { 
        progress: 75, 
        actual_video_time: currentTime,
        total_time_on_page: totalTimeOnPage,
        country: geolocationData.current?.country_name || 'Unknown'
      });
    }
  };

  const scrollToPurchaseButton = () => {
    try {
      const purchaseSection = document.getElementById('six-bottle-package') || 
                             document.querySelector('[data-purchase-section]') ||
                             document.querySelector('.product-offers') ||
                             document.querySelector('button[class*="yellow"]');
      
      if (purchaseSection) {
        console.log('📍 Scrolling to purchase button after pitch moment');
        
        purchaseSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        purchaseSection.style.transition = 'all 0.5s ease';
        purchaseSection.style.transform = 'scale(1.02)';
        purchaseSection.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
        
        setTimeout(() => {
          purchaseSection.style.transform = 'scale(1)';
          purchaseSection.style.boxShadow = '';
        }, 3000);
        
      } else {
        console.log('⚠️ Purchase button not found for auto-scroll');
      }
    } catch (error) {
      console.error('Error scrolling to purchase button:', error);
    }
  };

  const trackOfferClick = (offerType: '1-bottle' | '3-bottle' | '6-bottle' | string) => {
    if (isBrazilianIP.current) return;
    
    trackEvent('offer_click', { 
      offer_type: offerType,
      country: geolocationData.current?.country_name || 'Unknown'
    });
  };

  return {
    trackVideoPlay,
    trackVideoProgress,
    trackOfferClick,
  };
};