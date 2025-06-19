"use client"
import React, { useEffect, useState } from 'react';

const GreetingComponent = () => {
  const [greeting, setGreeting] = useState('Hello');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get username from localStorage (where you stored it during login)
    const storedUsername = localStorage.getItem('studentEmail')?.split('@')[0] || 'Guest';
    setUsername(storedUsername);

    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      let newGreeting = 'Hello';

      if (currentHour >= 5 && currentHour < 12) {
        newGreeting = 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        newGreeting = 'Good Afternoon';
      } else {
        newGreeting = 'Good Evening';
      }

      setGreeting(newGreeting);
    };

    // Update immediately
    updateGreeting();

    // Set up interval to update every minute (60000ms)
    const intervalId = setInterval(updateGreeting, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-lg font-medium text-gray-800 dark:text-gray-800">
      {`${greeting}, ${username.charAt(0).toUpperCase() + username.slice(1)}`}
    </div>
  );
};

export default GreetingComponent;