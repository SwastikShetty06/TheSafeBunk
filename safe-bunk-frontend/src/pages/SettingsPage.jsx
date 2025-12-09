import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetError } from '../slices/timetableSlice';
import { Trash2, Calendar, ArrowLeft, Plus, RefreshCw, PenSquare, Check, X } from 'lucide-react';

const SettingsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [activeSemester, setActiveSemester] = useState(null);
    const [newSemesterName, setNewSemesterName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            const { data } = await api.get('/setup/semesters');
            setSemesters(data.semesters);
            setActiveSemester(data.activeSemester);
        } catch (error) {
            console.error("Failed to load semesters", error);
        }
    };

    const handleSwitch = async (semesterId) => {
        if (loading) return;
        setLoading(true);
        try {
            await api.post('/setup/semester/switch', { semesterId });
            setActiveSemester(semesterId);
            // Reload page or force refresh context if needed, but navigation will likely trigger re-fetch on dashboard
            // Could also dispatch a reset to clear old Redux data
            alert("Switched semester successfully!");
        } catch (error) {
            alert('Error switching semester');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSemester = async () => {
        if (!newSemesterName.trim()) return;
        setLoading(true);
        try {
            await api.post('/setup/semester/new', { name: newSemesterName });
            setNewSemesterName('');
            await fetchSemesters();
            alert("New semester started!");
        } catch (error) {
            alert('Error creating semester');
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (id) => {
        try {
            await api.post('/setup/semester/rename', { semesterId: id, name: editName });
            setEditingId(null);
            fetchSemesters();
        } catch (error) {
            alert('Error renaming semester');
        }
    };

    /* Legacy Reset - Keeping as "Delete All Data" option if needed, or replace with Archive? 
       User asked: "Start new semester, we don't need to restart... only add new semester". 
       So the destructive reset is less useful now, but maybe still good for valid "Start Over" scenarios.
       Let's rename it to "Reset Current Semester Data" or hide it. 
       Let's keep it but put it in a "Danger Zone" at bottom.
    */
    const handleReset = async () => {
        if (!window.confirm('DANGER: This will wipe ALL subjects and attendance for your account (legacy reset). Are you sure?')) {
            return;
        }
        setLoading(true);
        try {
            await api.post('/setup/reset');
            dispatch(resetError());
            navigate('/setup');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                </div>

                <div className="space-y-6">
                    {/* Semester Management */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RefreshCw size={20} className="text-blue-600" />
                            Semester Management
                        </h3>

                        <div className="space-y-3 mb-6">
                            {semesters.map(sem => (
                                <div key={sem._id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${activeSemester === sem._id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex-1">
                                        {editingId === sem._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="px-2 py-1 text-sm border rounded"
                                                />
                                                <button onClick={() => handleRename(sem._id)} className="text-green-600"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${activeSemester === sem._id ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {sem.name}
                                                </span>
                                                {activeSemester === sem._id && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Active</span>}
                                                <button
                                                    onClick={() => { setEditingId(sem._id); setEditName(sem.name); }}
                                                    className="text-gray-400 hover:text-gray-600 ml-2"
                                                >
                                                    <PenSquare size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Started: {new Date(sem.startDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {activeSemester !== sem._id && (
                                        <button
                                            onClick={() => handleSwitch(sem._id)}
                                            disabled={loading}
                                            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
                                        >
                                            Switch
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <input
                                type="text"
                                placeholder="New Semester Name (e.g. 'Sem 4')"
                                value={newSemesterName}
                                onChange={(e) => setNewSemesterName(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={handleCreateSemester}
                                disabled={loading || !newSemesterName.trim()}
                                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Start New
                            </button>
                        </div>
                    </div>

                    {/* Schedule Management */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">Current Schedule</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Modify subjects and weekly timetable for the active semester.
                                </p>
                                <button
                                    onClick={() => navigate('/settings/edit-schedule')}
                                    className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                                >
                                    Edit Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
