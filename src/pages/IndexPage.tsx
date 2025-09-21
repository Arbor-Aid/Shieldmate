
import React from 'react';
import Index from './Index';
import { trackEvent } from '@/lib/firebase';

// This is a wrapper component to maintain backward compatibility
const IndexPage = () => {
  React.useEffect(() => {
    trackEvent('page_viewed', { page: 'index' });
  }, []);
  
  return <Index />;
};

export default IndexPage;
