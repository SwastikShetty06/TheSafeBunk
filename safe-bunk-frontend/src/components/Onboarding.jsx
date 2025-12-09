import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, Plus, Trash2 } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [subjects, setSubjects] = useState(['']);
    const [schedule, setSchedule] = useState({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    });
    const [createdSubjects, setCreatedSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddSubject = () => setSubjects([...subjects, '']);
    const handleRemoveSubject = (idx) => {
        const newSubjects = subjects.filter((_, i) => i !== idx);
        setSubjects(newSubjects.length ? newSubjects : ['']);
    };
    const handleSubjectChange = (index, value) => {
        const newSubjects = [...subjects];
        newSubjects[index] = value;
        setSubjects(newSubjects);
    };

    const submitSubjects = async (e) => {
        e.preventDefault();
        const validSubjects = subjects.filter(s => s.trim() !== '');
        if (!validSubjects.length) return alert('Please add at least one subject');

        setLoading(true);
        try {
            const { data } = await api.post('/setup/subjects', { subjects: validSubjects });
            setCreatedSubjects(data);
            setStep(2);
        } catch (error) {
            alert('Error creating subjects: ' + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const addToDay = (day, subjectId) => {
        if (!subjectId) return;
        setSchedule({
            ...schedule,
            [day]: [...schedule[day], subjectId]
        });
    };

    const submitTimetable = async () => {
        setLoading(true);
        try {
            await api.post('/setup/timetable', { schedule });
            navigate('/dashboard');
        } catch (error) {
            alert('Error creating timetable: ' + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className={`mx-auto transition-all duration-300 ${step === 1 ? 'max-w-3xl' : 'max-w-6xl'}`}>
                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
                        <span className={step >= 1 ? 'text-blue-600' : ''}>Subjects</span>
                        <span className={step >= 2 ? 'text-blue-600' : ''}>Timetable</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </div>
                </div>

                {step === 1 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <BookOpen size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">What are you studying?</h2>
                            <p className="text-gray-500 mt-2">Add all the subjects you have this semester.</p>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {subjects.map((sub, idx) => (
                                <div key={idx} className="flex gap-2 group">
                                    <input
                                        value={sub}
                                        onChange={(e) => handleSubjectChange(idx, e.target.value)}
                                        placeholder={`Subject ${idx + 1} (e.g. Data Structures)`}
                                        className="flex-1 block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors outline-none"
                                        autoFocus={idx === subjects.length - 1}
                                    />
                                    {subjects.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveSubject(idx)}
                                            className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddSubject}
                                className="flex-1 py-3 px-4 border border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Add Another Subject
                            </button>
                            <button
                                onClick={submitSubjects}
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : 'Next Step'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="md:flex justify-between items-start mb-8 gap-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Set your Timetable</h2>
                                <p className="text-gray-500 mt-2">Assign subjects to days.</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 p-4 bg-gray-50 rounded-xl border border-gray-100 max-w-sm">
                                {createdSubjects.map(sub => (
                                    <span key={sub._id} className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm">
                                        {sub.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Object.keys(schedule).map(day => (
                                <div key={day} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-500" />
                                        {day}
                                    </h4>

                                    <div className="space-y-2 mb-3">
                                        {schedule[day].length === 0 && <p className="text-xs text-gray-400 italic">No classes</p>}
                                        {schedule[day].map((sid, idx) => {
                                            const sub = createdSubjects.find(s => s._id === sid);
                                            return (
                                                <div key={idx} className="bg-white px-3 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm border border-gray-100 flex justify-between items-center group">
                                                    {sub?.name}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <select
                                        onChange={(e) => { addToDay(day, e.target.value); e.target.value = ""; }}
                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer text-gray-600"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>+ Add Class</option>
                                        {createdSubjects.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={submitTimetable}
                                disabled={loading}
                                className="py-3 px-8 bg-black text-white rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2 disabled:opacity-70 transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Finishing...' : 'Complete Setup'}
                                <CheckCircle size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Start Icon for button
import { CheckCircle } from 'lucide-react';

export default Onboarding;
