import { useState } from 'react';

/**
 * Custom hook for drag-and-drop reordering
 * @param {Array} items - Array of items to reorder
 * @param {Function} onReorder - Callback function called with new order array
 * @param {Object} options - Optional configuration
 * @param {string} options.idKey - Key to extract ID from items (default: '_id')
 * @param {string} options.successMessage - Message to show on successful reorder
 * @param {Function} options.onSuccess - Callback after successful reorder
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Drag handlers and utilities
 */
export const useDragReorder = (items, onReorder, options = {}) => {
  const { 
    idKey = '_id',
    successMessage = 'Order updated successfully!',
    onSuccess,
    onError
  } = options;
  
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Create new order array with IDs
    const newOrder = items.map(item => {
      const id = item[idKey];
      return typeof id === 'object' && id !== null ? id.toString() : id;
    });

    // Reorder
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    try {
      setIsLoading(true);
      setMessage(null);
      
      // Call the callback with new order
      await onReorder(newOrder);
      
      // Show success message
      setMessage({ type: 'success', text: successMessage });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(newOrder);
      }
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      // Show error message
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update order' 
      });
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
      setDraggedIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * Manually clear the message
   */
  const clearMessage = () => {
    setMessage(null);
  };

  /**
   * Get all drag props for a draggable item
   * @param {number} index - Index of the item
   * @returns {Object} Props to spread on draggable element
   */
  const getDragProps = (index) => ({
    draggable: !isLoading,
    onDragStart: (e) => handleDragStart(e, index),
    onDragOver: (e) => handleDragOver(e, index),
    onDrop: (e) => handleDrop(e, index),
    onDragEnd: handleDragEnd,
    style: {
      cursor: isLoading ? 'wait' : (draggedIndex === index ? 'grabbing' : 'grab'),
      opacity: draggedIndex === index ? 0.5 : 1,
      pointerEvents: isLoading ? 'none' : 'auto'
    }
  });

  /**
   * Get drag handle icon component
   */
  const getDragHandleIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ cursor: isLoading ? 'wait' : 'grab' }}
    >
      <path d="M5 3a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM5 7a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zM5 11a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );

  /**
   * Get message component to display
   */
  const MessageComponent = message ? (
    <div
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
        color: message.type === 'success' ? '#155724' : '#721c24',
        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
      }}
    >
      <span>{message.text}</span>
      <button
        onClick={clearMessage}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 8px',
          color: 'inherit'
        }}
      >
        ×
      </button>
    </div>
  ) : null;

  return {
    draggedIndex,
    isLoading,
    message,
    MessageComponent,
    clearMessage,
    getDragProps,
    getDragHandleIcon,
    // Export individual handlers if needed
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};