import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async actions
export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', userData);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage,
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('user');
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
