import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import timetableReducer from '../slices/timetableSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        timetable: timetableReducer,
    },
});
