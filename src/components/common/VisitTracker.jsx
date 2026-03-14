import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

const VisitTracker = () => {
  const location = useLocation();
  useEffect(() => {
    apiRequest('/visits', 'POST', { path: location.pathname });
  }, [location.pathname]);
  return null;
};

export default VisitTracker;
