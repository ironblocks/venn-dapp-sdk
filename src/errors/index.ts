import * as apiErrors from './api.errors';
import * as serverErrors from './server.errors';

export const errors = {
    ...serverErrors,
    ...apiErrors,
};
