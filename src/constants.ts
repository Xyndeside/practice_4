export const STATUS_NEW = 'Новая';
export const STATUS_ASSIGNED = 'Мероприятие назначено';
export const STATUS_DONE = 'Завершено';
export const ADMIN_STATUSES = [STATUS_ASSIGNED, STATUS_DONE];

export const PAYMENT_METHODS = ['onsite', 'sbp'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ADMIN_LOGIN = 'Conf2027';
export const ADMIN_PASSWORD = 'Demo77';
