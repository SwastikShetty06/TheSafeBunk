import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchTodayClasses = createAsyncThunk('timetable/fetchToday', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/dashboard/today');
        return data; // { day: 'Monday', classes: [] }
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const markAttendance = createAsyncThunk('timetable/markAttendance', async ({ subjectId, status, date }, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/attendance/mark', { subjectId, status, date });
        return data; // { subject: {}, logic: {} }
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStats = createAsyncThunk('timetable/fetchStats', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/dashboard/stats');
        return data; // [Subject1, Subject2, ...]
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const timetableSlice = createSlice({
    name: 'timetable',
    initialState: {
        todayClasses: [],
        allSubjects: [],
        day: '',
        day: '',
        isLoading: false,
        error: null,
        setupNeeded: false,
        lastUpdate: null,
    },
    reducers: {
        resetError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodayClasses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.setupNeeded = false;
            })
            .addCase(fetchTodayClasses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.todayClasses = action.payload.classes;
                state.day = action.payload.day;
            })
            .addCase(fetchTodayClasses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                if (action.payload && action.payload.includes('setup')) {
                    state.setupNeeded = true;
                }
                if (action.payload && action.payload.includes('setup')) {
                    state.setupNeeded = true;
                }
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.allSubjects = action.payload;
            })
            .addCase(markAttendance.fulfilled, (state, action) => {
                // Update the specific subject in the list
                const updatedSubject = action.payload.subject;
                const index = state.todayClasses.findIndex(s => s._id === updatedSubject._id);
                if (index !== -1) {
                    state.todayClasses[index] = { ...state.todayClasses[index], ...updatedSubject };
                }

                // Also update allSubjects if present
                const allIndex = state.allSubjects.findIndex(s => s._id === updatedSubject._id);
                if (allIndex !== -1) {
                    state.allSubjects[allIndex] = { ...state.allSubjects[allIndex], ...updatedSubject };
                }
                state.lastUpdate = action.payload.logic; // Store logic result for UI
            });
    },
});

export const { resetError } = timetableSlice.actions;
export default timetableSlice.reducer;
