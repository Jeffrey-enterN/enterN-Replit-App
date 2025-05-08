/**
 * WebSocket Connection Manager
 * 
 * Manages real-time WebSocket connections for instant notifications
 * about matches, messages, and other time-sensitive events.
 */

type WebSocketMessage = {
  type: string;
  payload?: any;
  timestamp?: number;
};

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private url: string;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  
  /**
   * Create a new WebSocket manager
   * 
   * @param path The path to connect to, defaults to '/ws'
   */
  constructor(path: string = '/ws') {
    // Determine the correct WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}${path}`;
  }
  
  /**
   * Connect to the WebSocket server
   * 
   * @returns A promise that resolves when connected
   */
  public connect(): Promise<void> {
    // Don't try to connect if already connecting or connected
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
          
          // Send a ping to verify connection
          this.send({
            type: 'ping',
            timestamp: Date.now()
          });
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handleMessage(message);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.socket = null;
          this.isConnecting = false;
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect() {
    // Don't try to reconnect if we've reached the maximum attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      return;
    }
    
    // Increase the delay with each attempt (exponential backoff)
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    
    // Clear any existing reconnect timer
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
    }
    
    console.log(`Attempting to reconnect in ${delay}ms`);
    
    // Set a timer to reconnect
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // If reconnect fails, it will automatically try again
      });
    }, delay);
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * 
   * @param message The message to send
   */
  public send(message: WebSocketMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not open');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      return false;
    }
  }
  
  /**
   * Register a handler for a specific message type
   * 
   * @param type The message type to handle
   * @param handler The handler function
   */
  public on(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
  }
  
  /**
   * Unregister a handler for a specific message type
   * 
   * @param type The message type
   * @param handler The handler function to remove
   */
  public off(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      return;
    }
    
    const handlers = this.messageHandlers.get(type)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
  
  /**
   * Handle an incoming message
   * 
   * @param message The message to handle
   */
  private handleMessage(message: WebSocketMessage) {
    // Global message handler - logs all messages
    console.debug('WebSocket message received:', message);
    
    // Handle specific message types
    switch (message.type) {
      case 'pong':
        // Connection verification response
        console.log('Pong received, latency:', Date.now() - (message.timestamp || 0), 'ms');
        break;
        
      case 'connection':
        // Connection confirmation message
        console.log('Connection confirmed:', message.payload);
        break;
        
      case 'new_match':
        // Notify of a new match
        this.notifyHandlers('new_match', message);
        break;
        
      case 'job_shared':
        // Employer shared a job
        this.notifyHandlers('job_shared', message);
        break;
        
      case 'job_interest':
        // Jobseeker expressed interest in a job
        this.notifyHandlers('job_interest', message);
        break;
        
      case 'interview_scheduled':
        // Interview has been scheduled
        this.notifyHandlers('interview_scheduled', message);
        break;
        
      default:
        // Unknown message type
        this.notifyHandlers(message.type, message);
    }
  }
  
  /**
   * Notify all handlers for a specific message type
   * 
   * @param type The message type
   * @param message The message to pass to handlers
   */
  private notifyHandlers(type: string, message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(type);
    
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (err) {
          console.error(`Error in ${type} handler:`, err);
        }
      }
    }
  }
}

// Create a singleton instance
const websocketManager = new WebSocketManager();
export default websocketManager;