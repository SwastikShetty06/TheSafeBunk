import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';

const Analytics = () => {
    const { todayClasses, allSubjects } = useSelector((state) => state.timetable);

    // Use allSubjects if available (it should be after fetchStats), otherwise fallback to todayClasses (which is partial)
    // Actually, we want semester stats, so we should prioritize allSubjects.
    // If allSubjects is empty (loading), we might show 0.
    const subjectsToUse = allSubjects && allSubjects.length > 0 ? allSubjects : [];

    // Aggregate data
    let totalAttended = 0;
    let totalClasses = 0;

    subjectsToUse.forEach(sub => {
        totalAttended += sub.attendedLectures;
        totalClasses += sub.totalLectures;
    });

    const totalBunked = totalClasses - totalAttended;

    const data = [
        { name: 'Attended', value: totalAttended },
        { name: 'Bunked', value: totalBunked }
    ];

    const COLORS = ['#22c55e', '#ef4444'];

    if (totalClasses === 0) return null;

    const globalPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Current Semester Stats</h3>

            <div className="relative w-full h-[300px]">
                {/* Centered Percentage */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="text-4xl font-extrabold text-gray-900">{globalPercentage}%</span>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Attendance</p>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 mb-8 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-600 font-medium">Attended</p>
                    <p className="text-2xl font-bold text-emerald-800">{totalAttended}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-sm text-red-600 font-medium">Bunked</p>
                    <p className="text-2xl font-bold text-red-800">{totalBunked}</p>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Subject Breakdown</h4>
                {subjectsToUse.map(sub => {
                    const pct = sub.totalLectures > 0 ? ((sub.attendedLectures / sub.totalLectures) * 100).toFixed(1) : 0;
                    const isSafe = pct >= 75; // Using default for display
                    return (
                        <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{sub.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>{pct}%</span>
                                <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Analytics;
