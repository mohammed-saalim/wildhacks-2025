
import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export const NavigationGuard = ({ when, onLeave }) => {
  const navigator = useContext(NavigationContext)?.navigator;

  useEffect(() => {
    if (!when || !navigator) return;

    const originalPush = navigator.push;

    navigator.push = async (...args) => {
      const confirmLeave = window.confirm("You have an ongoing interview. Finish it before leaving?");
      if (confirmLeave) {
        try {
          await onLeave?.(); // stop camera or cleanup
        } catch (e) {
          console.error("Error in onLeave:", e);
        }
        originalPush(...args);
      }
    };

    return () => {
      navigator.push = originalPush;
    };
  }, [when, onLeave, navigator]);

  return null;
};
