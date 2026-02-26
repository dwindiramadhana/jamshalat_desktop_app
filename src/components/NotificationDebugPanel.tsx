import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export function NotificationDebugPanel() {
  const [debugInfo, setDebugInfo] = useState({
    platform: '',
    isNative: false,
    permission: '',
    channelsCreated: false,
    lastUpdate: '',
  });
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      let permission = 'unknown';
      let channelsCreated = false;

      if (isNative) {
        try {
          const result = await LocalNotifications.checkPermissions();
          permission = result.display;
          
          // Try to list channels to see if they exist
          const channels = await LocalNotifications.listChannels();
          channelsCreated = channels.channels.length > 0;
        } catch (error) {
          permission = `error: ${error}`;
        }
      }

      setDebugInfo({
        platform,
        isNative,
        permission,
        channelsCreated,
        lastUpdate: new Date().toLocaleTimeString(),
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const testNotification = async () => {
    try {
      setTestResult('Sending...');
      
      // Test 1: Simple popup notification
      await LocalNotifications.schedule({
        notifications: [{
          id: 888,
          title: 'Test Notification',
          body: 'If you see this, notifications work!',
          channelId: 'prayer_times',
        }]
      });
      
      setTestResult('✓ Sent popup');
      
      // Test 2: Ongoing persistent notification
      setTimeout(async () => {
        await LocalNotifications.schedule({
          notifications: [{
            id: 999,
            title: '🕌 Test Persistent',
            body: 'This should stay in notification area',
            channelId: 'countdown',
            ongoing: true,
            autoCancel: false,
          }]
        });
        setTestResult('✓ Sent persistent');
      }, 2000);
    } catch (error) {
      setTestResult(`✗ Error: ${error}`);
    }
  };

  // Only show on mobile
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white text-xs p-3 z-50 font-mono">
      <div className="max-w-md mx-auto space-y-1">
        <div className="flex justify-between">
          <span>Platform:</span>
          <span className="text-green-400">{debugInfo.platform}</span>
        </div>
        <div className="flex justify-between">
          <span>Native:</span>
          <span className={debugInfo.isNative ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.isNative ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Permission:</span>
          <span className={debugInfo.permission === 'granted' ? 'text-green-400' : 'text-yellow-400'}>
            {debugInfo.permission}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Channels:</span>
          <span className={debugInfo.channelsCreated ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.channelsCreated ? '✓ Created' : '✗ Not created'}
          </span>
        </div>
        
        {/* Test Button */}
        <div className="mt-3 pt-2 border-t border-gray-700">
          <button
            onClick={testNotification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Test Notifications
          </button>
          {testResult && (
            <div className="mt-2 text-center text-yellow-300">
              {testResult}
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-400 mt-2">
          Updated: {debugInfo.lastUpdate}
        </div>
      </div>
    </div>
  );
}
