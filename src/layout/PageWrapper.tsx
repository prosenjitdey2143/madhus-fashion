import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analytics/analyticsService';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
}

export function PageWrapper({ children, title }: PageWrapperProps) {
  const location = useLocation();

  useEffect(() => {
    // SEO Document Title management
    document.title = `${title} | Madhus Fashion House`;
    // Scroll to top on page transition
    window.scrollTo(0, 0);
    // Track Page View
    analyticsService.pageView(location.pathname, title);
  }, [title, location.pathname]);

  return (
    <div className="w-full flex-grow"
    >
      {children}
    </div>
  );
}
