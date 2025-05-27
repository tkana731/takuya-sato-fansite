// hooks/useGoogleAnalytics.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const useGoogleAnalytics = () => {
  const router = useRouter();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Google Analytics スクリプトを動的に追加
    const loadGA = () => {
      // gtag.js スクリプトが既に存在するかチェック
      if (document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
        return;
      }

      // gtag.js スクリプトを追加
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(gtagScript);

      // gtag 初期化スクリプトを追加
      const gtagInitScript = document.createElement('script');
      gtagInitScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `;
      document.head.appendChild(gtagInitScript);
    };

    loadGA();

    // ページ遷移時のトラッキング
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};

// イベント送信用関数
export const trackEvent = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};