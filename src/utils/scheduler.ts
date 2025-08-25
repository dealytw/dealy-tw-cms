/**
 * Scheduler Utility for Strapi CMS
 * Handles scheduled publication of coupons and other content
 */

export interface ScheduledTask {
  id: string;
  type: 'coupon_publication' | 'coupon_expiration' | 'reminder' | 'cleanup';
  targetId: string;
  targetType: string;
  scheduledDate: Date;
  data?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchedulerConfig {
  checkInterval: number; // milliseconds
  maxRetries: number;
  cleanupAfterDays: number;
  enableLogging: boolean;
}

export class ContentScheduler {
  private strapi: any; // Using any for now to avoid import issues
  private config: SchedulerConfig;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor(strapi: any, config: Partial<SchedulerConfig> = {}) {
    this.strapi = strapi;
    this.config = {
      checkInterval: 60000, // 1 minute
      maxRetries: 3,
      cleanupAfterDays: 30,
      enableLogging: true,
      ...config
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      this.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.log('Starting content scheduler...');

    // Initial check
    this.processScheduledTasks();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.processScheduledTasks();
    }, this.config.checkInterval);

    this.log(`Scheduler started with ${this.config.checkInterval}ms interval`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('Scheduler is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.log('Scheduler stopped');
  }

  /**
   * Process all scheduled tasks
   */
  private async processScheduledTasks(): Promise<void> {
    try {
      const now = new Date();
      
      // Get pending tasks that are due
      const pendingTasks = await this.getPendingTasks(now);
      
      if (pendingTasks.length === 0) {
        return;
      }

      this.log(`Processing ${pendingTasks.length} scheduled tasks`);

      for (const task of pendingTasks) {
        await this.processTask(task);
      }

      // Cleanup old completed tasks
      await this.cleanupOldTasks();
      
    } catch (error) {
      this.log(`Error processing scheduled tasks: ${error}`, 'error');
    }
  }

  /**
   * Get pending tasks that are due
   */
  private async getPendingTasks(now: Date): Promise<ScheduledTask[]> {
    try {
      // Check for scheduled coupon publications
      const scheduledCoupons = await this.strapi.entityService.findMany('api::coupon.coupon', {
        filters: {
          scheduled_publish_date: { $lte: now.toISOString() },
          approval_status: 'approved',
          publishedAt: { $null: true }
        },
        fields: ['id', 'scheduled_publish_date', 'approval_status']
      });

      return scheduledCoupons.map(coupon => ({
        id: `coupon_${coupon.id}`,
        type: 'coupon_publication',
        targetId: coupon.id.toString(),
        targetType: 'coupon',
        scheduledDate: new Date(coupon.scheduled_publish_date),
        data: { couponId: coupon.id },
        status: 'pending',
        retryCount: 0,
        maxRetries: this.config.maxRetries,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      this.log(`Error getting pending tasks: ${error}`, 'error');
      return [];
    }
  }

  /**
   * Process a single scheduled task
   */
  private async processTask(task: ScheduledTask): Promise<void> {
    try {
      this.log(`Processing task: ${task.type} for ${task.targetType} ${task.targetId}`);

      // Mark task as processing
      task.status = 'processing';
      task.updatedAt = new Date();

      let success = false;

      switch (task.type) {
        case 'coupon_publication':
          success = await this.publishScheduledCoupon(task);
          break;
        case 'coupon_expiration':
          success = await this.expireCoupon(task);
          break;
        default:
          this.log(`Unknown task type: ${task.type}`, 'warn');
          success = false;
      }

      // Update task status
      task.status = success ? 'completed' : 'failed';
      task.updatedAt = new Date();

      if (success) {
        this.log(`Task completed successfully: ${task.type} for ${task.targetType} ${task.targetId}`);
      } else {
        this.log(`Task failed: ${task.type} for ${task.targetType} ${task.targetId}`, 'error');
        
        // Increment retry count
        task.retryCount++;
        
        if (task.retryCount < task.maxRetries) {
          // Reschedule for later
          const retryDelay = Math.pow(2, task.retryCount) * 5 * 60 * 1000; // Exponential backoff
          task.scheduledDate = new Date(Date.now() + retryDelay);
          task.status = 'pending';
          this.log(`Rescheduling task for retry ${task.retryCount}/${task.maxRetries} in ${retryDelay}ms`);
        }
      }

    } catch (error) {
      this.log(`Error processing task ${task.id}: ${error}`, 'error');
      task.status = 'failed';
      task.updatedAt = new Date();
    }
  }

  /**
   * Publish a scheduled coupon
   */
  private async publishScheduledCoupon(task: ScheduledTask): Promise<boolean> {
    try {
      const couponId = task.data.couponId;
      
      // Get the coupon
      const coupon = await this.strapi.entityService.findOne('api::coupon.coupon', couponId, {
        fields: ['id', 'scheduled_publish_date', 'approval_status', 'publishedAt']
      });

      if (!coupon) {
        this.log(`Coupon ${couponId} not found`, 'error');
        return false;
      }

      if (coupon.publishedAt) {
        this.log(`Coupon ${couponId} is already published`, 'warn');
        return true;
      }

      // Publish the coupon
      await this.strapi.entityService.update('api::coupon.coupon', couponId, {
        data: {
          publishedAt: new Date().toISOString(),
          scheduled_publish_date: null // Clear scheduled date
        }
      });

      this.log(`Coupon ${couponId} published successfully`);
      return true;

    } catch (error) {
      this.log(`Error publishing coupon ${task.data.couponId}: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Expire a coupon
   */
  private async expireCoupon(task: ScheduledTask): Promise<boolean> {
    try {
      const couponId = task.targetId;
      
      // Update coupon status to expired
      await this.strapi.entityService.update('api::coupon.coupon', couponId, {
        data: {
          coupon_status: 'expired'
        }
      });

      this.log(`Coupon ${couponId} marked as expired`);
      return true;

    } catch (error) {
      this.log(`Error expiring coupon ${task.targetId}: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Clean up old completed tasks
   */
  private async cleanupOldTasks(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.cleanupAfterDays);

      // This would typically clean up a tasks table
      // For now, we'll just log the cleanup
      this.log(`Cleanup: Would remove tasks older than ${cutoffDate.toISOString()}`);
      
    } catch (error) {
      this.log(`Error during cleanup: ${error}`, 'error');
    }
  }

  /**
   * Schedule a new task
   */
  async scheduleTask(
    type: ScheduledTask['type'],
    targetId: string,
    targetType: string,
    scheduledDate: Date,
    data?: any
  ): Promise<string> {
    const taskId = `${type}_${targetId}_${Date.now()}`;
    
    const task: ScheduledTask = {
      id: taskId,
      type,
      targetId,
      targetType,
      scheduledDate,
      data,
      status: 'pending',
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.log(`Scheduled task: ${type} for ${targetType} ${targetId} at ${scheduledDate.toISOString()}`);
    
    // In a real implementation, you'd save this to a database
    // For now, we'll just return the task ID
    return taskId;
  }

  /**
   * Cancel a scheduled task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      this.log(`Cancelling task: ${taskId}`);
      
      // In a real implementation, you'd update the task status in the database
      // For now, we'll just return true
      return true;
      
    } catch (error) {
      this.log(`Error cancelling task ${taskId}: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; config: SchedulerConfig } {
    return {
      isRunning: this.isRunning,
      config: this.config
    };
  }

  /**
   * Log messages
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[Scheduler ${timestamp}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

/**
 * Initialize scheduler when Strapi starts
 */
export function initializeScheduler(strapi: any): ContentScheduler {
  const scheduler = new ContentScheduler(strapi, {
    checkInterval: 60000, // 1 minute
    maxRetries: 3,
    cleanupAfterDays: 30,
    enableLogging: true
  });

  // Start scheduler after Strapi is fully loaded
  strapi.hook('strapi::bootstrap').register(async () => {
    // Wait a bit for all content types to be loaded
    setTimeout(() => {
      scheduler.start();
    }, 5000);
  });

  // Stop scheduler when Strapi shuts down
  strapi.hook('strapi::destroy').register(async () => {
    scheduler.stop();
  });

  return scheduler;
}

/**
 * Utility functions for scheduling
 */

export function scheduleCouponPublication(
  strapi: any,
  couponId: string,
  publishDate: Date
): Promise<string> {
  const scheduler = strapi.plugin('content-scheduler')?.service('scheduler');
  if (!scheduler) {
    throw new Error('Scheduler service not available');
  }
  
  return scheduler.scheduleTask(
    'coupon_publication',
    couponId,
    'coupon',
    publishDate,
    { couponId }
  );
}

export function scheduleCouponExpiration(
  strapi: any,
  couponId: string,
  expiryDate: Date
): Promise<string> {
  const scheduler = strapi.plugin('content-scheduler')?.service('scheduler');
  if (!scheduler) {
    throw new Error('Scheduler service not available');
  }
  
  return scheduler.scheduleTask(
    'coupon_expiration',
    couponId,
    'coupon',
    expiryDate
  );
}
