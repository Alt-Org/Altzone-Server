/**
 * Enum with notification statuses.
 *
 * Notification status mimic the REST architecture HTTP method,
 * but in a way which is more suitable for a notifications.
 *
 * The notifications are mostly sent of a continuing processes status updates.
 * For example NEW - new voting started, END - voting ended.
 */
export enum NotificationStatus {
    /**
     * New process is started. For example new voting started.
     */
    NEW = 'new',
    /**
     * Update of the progress. For example somebody have sent a new vote.
     */
    UPDATE = 'update',
    /**
     * Error of the process. Some expected or unexpected error happen.
     */
    ERROR = 'error',
    /**
     * End of the process. For example the voting has been ended.
     */
    END = 'end'
}