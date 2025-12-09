import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayClasses, markAttendance, fetchStats } from '../slices/timetableSlice';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Analytics from '../components/Analytics';
import { LogOut, CheckCircle, XCircle, Ban, TrendingUp, AlertTriangle, Settings } from 'lucide-react';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { todayClasses, day, isLoading, error, setupNeeded, lastUpdate } = useSelector((state) => state.timetable);
    const [scrolled, setScrolled] = useState(false);
    const [markedSubjects, setMarkedSubjects] = useState({});

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            dispatch(fetchTodayClasses());
            dispatch(fetchStats()); // Fetch all subjects for analytics
        }
    }, [user, navigate, dispatch]);

    // Initialize marked state from backend data
    useEffect(() => {
        if (todayClasses.length > 0) {
            const initialStatus = {};
            todayClasses.forEach(sub => {
                if (sub.todayStatus) {
                    initialStatus[sub._id] = sub.todayStatus;
                }
            });
            // Only update if we have new info to avoid infinite loops or overwriting user edits
            // But since this is effect dependent on todayClasses, it's fine
            setMarkedSubjects(prev => ({ ...initialStatus, ...prev }));
        }
    }, [todayClasses]);

    useEffect(() => {
        if (setupNeeded) {
            navigate('/setup');
        }
    }, [setupNeeded, navigate]);

    useEffect(() => {
        // Trigger confetti if status becomes SAFE
        if (lastUpdate && lastUpdate.status === 'SAFE') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#ffffff', '#fbbf24']
            });
        }
    }, [lastUpdate]);

    const handleAttendance = (subjectId, status) => {
        // if (markedSubjects[subjectId]) return; // Removed to allow editing
        dispatch(markAttendance({ subjectId, status }));
        setMarkedSubjects(prev => ({ ...prev, [subjectId]: status }));
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium animate-pulse">
            Loading your schedule...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
            {/* Navbar */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'} px-6`}>
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Hey, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Today is {day}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={() => { dispatch(logout()); navigate('/login'); }}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6">

                {error && !setupNeeded && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={18} />
                        {error}
                    </div>
                )}

                {todayClasses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 mt-6">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No classes today!</h3>
                        <p className="text-gray-500">Enjoy your free time or catch up on studies.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {todayClasses.map((subject) => {
                            const percent = subject.currentPercentage ? subject.currentPercentage.toFixed(1) : 0;
                            const target = user.minAttendance || 75;
                            const isSafe = percent >= target;

                            return (
                                <div key={subject._id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                                    {/* Left Border Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pl-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{subject.name}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-2xl font-extrabold tracking-tight ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {percent}%
                                                </span>
                                                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                                    {subject.attendedLectures} / {subject.totalLectures}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {lastUpdate && lastUpdate.subject === subject._id && (
                                            <div className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${lastUpdate.status === 'SAFE'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                }`}>
                                                {lastUpdate.status === 'SAFE' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                                {lastUpdate.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 gap-2 pl-2">
                                        {markedSubjects[subject._id] ? (
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2
                                                    ${markedSubjects[subject._id] === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        markedSubjects[subject._id] === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {markedSubjects[subject._id] === 'Present' && <CheckCircle size={16} />}
                                                    {markedSubjects[subject._id] === 'Absent' && <XCircle size={16} />}
                                                    {markedSubjects[subject._id] === 'Cancelled' && <Ban size={16} />}
                                                    Marked {markedSubjects[subject._id]}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Enable edit mode by clearing local state but NOT dispatching anything yet
                                                        // But wait, if we clear local state, it will show buttons. 
                                                        // We need a subtle way to say "Editing".
                                                        // Actually, simply clearing the marked state from local UI is enough to show buttons again.
                                                        setMarkedSubjects(prev => {
                                                            const newState = { ...prev };
                                                            delete newState[subject._id];
                                                            return newState;
                                                        });
                                                    }}
                                                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                                    title="Edit Attendance"
                                                >
                                                    <Settings size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleAttendance(subject._id, 'Present')}
                                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all duration-200 active:scale-95 text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-transparent hover:border-emerald-200"
                                                >
                                                    <CheckCircle size={16} />
                                                    <span>Present</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAttendance(subject._id, 'Absent')}
                                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all duration-200 active:scale-95 text-xs sm:text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border-transparent hover:border-rose-200"
                                                >
                                                    <XCircle size={16} />
                                                    <span>Absent</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAttendance(subject._id, 'Cancelled')}
                                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl border transition-all duration-200 active:scale-95 text-xs sm:text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent hover:border-gray-200"
                                                >
                                                    <Ban size={16} />
                                                    <span className="whitespace-nowrap">No Class</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Analytics Section */}
                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-4 px-2 justify-center">
                        <TrendingUp size={20} className="text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-800">Attendance Overview</h3>
                    </div>
                    <Analytics />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
