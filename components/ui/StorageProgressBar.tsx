import React from 'react';

interface StorageProgressBarProps {
  usedSize: string;
  totalSize: string;
  percentage: number;
}

const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  usedSize,
  totalSize,
  percentage
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '12px', 
      borderRadius: '8px',
      marginBottom: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333'
      }}>
        Storage Usage
      </div>
      
      <div style={{ 
        fontSize: '13px', 
        fontWeight: '500',
        marginBottom: '8px',
        color: '#555'
      }}>
        {usedSize} / {totalSize}
      </div>
      
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#E0E0E0',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(percentage, 100)}%`,
          height: '100%',
          backgroundColor: '#007BFF',
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#666',
        marginTop: '4px'
      }}>
        {percentage.toFixed(1)}% used
      </div>
    </div>
  );
};

export default StorageProgressBar;