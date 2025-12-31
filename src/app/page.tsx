"use client";

import { useState, useEffect, useRef } from "react";
import {
  Timer,
  Users,
  UserPlus,
  Play,
  Pause,
  Square,
  BarChart3,
  Send,
  Trash2,
  Plus,
  X,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Settings,
  Check,
  AlertCircle,
  Dumbbell,
  Bell,
  BellOff,
} from "lucide-react";

// Types
interface Person {
  id: string;
  name: string;
  slackId: string;
  color: string;
}

interface HangRecord {
  personId: string;
  duration: number; // in seconds
  timestamp: number;
}

interface Workout {
  id: string;
  date: number;
  participants: string[];
  records: HangRecord[];
  notes: string;
}

interface AppState {
  people: Person[];
  workouts: Workout[];
  slackWebhook: string;
  dailyReminderEnabled: boolean;
  reminderTime: string; // HH:MM format
  lastReminderSent: string; // YYYY-MM-DD format to track if already sent today
}

// Color palette for people
const COLORS = [
  "#7c3aed", "#ec4899", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1",
];

// Helper functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Mock data for demo
const MOCK_PEOPLE: Person[] = [
  { id: "person1", name: "Hadar Pinto", slackId: "@hadarp", color: "#7c3aed" },
  { id: "person2", name: "Yehonatan Zaritsky", slackId: "@yehonatanz", color: "#ec4899" },
  { id: "person3", name: "Roni Lippin", slackId: "@ronili", color: "#06b6d4" },
  { id: "person4", name: "Tomer Shkolnik", slackId: "@tomer", color: "#10b981" },
  { id: "person5", name: "Omer Burshtein", slackId: "@omerb", color: "#f59e0b" },
];

const generateMockWorkouts = (): Workout[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  return [
    // Week 1 - Day 1
    {
      id: "w1",
      date: now - 14 * day,
      participants: ["person1", "person2", "person3"],
      records: [
        { personId: "person1", duration: 45, timestamp: now - 14 * day },
        { personId: "person2", duration: 38, timestamp: now - 14 * day },
        { personId: "person3", duration: 52, timestamp: now - 14 * day },
      ],
      notes: "First group session!",
    },
    // Week 1 - Day 3
    {
      id: "w2",
      date: now - 12 * day,
      participants: ["person1", "person2", "person4"],
      records: [
        { personId: "person1", duration: 48, timestamp: now - 12 * day },
        { personId: "person2", duration: 42, timestamp: now - 12 * day },
        { personId: "person4", duration: 35, timestamp: now - 12 * day },
        { personId: "person1", duration: 44, timestamp: now - 12 * day },
        { personId: "person2", duration: 40, timestamp: now - 12 * day },
        { personId: "person4", duration: 38, timestamp: now - 12 * day },
      ],
      notes: "Tomer's first session!",
    },
    // Week 1 - Day 5
    {
      id: "w3",
      date: now - 10 * day,
      participants: ["person1", "person3", "person5"],
      records: [
        { personId: "person1", duration: 51, timestamp: now - 10 * day },
        { personId: "person3", duration: 58, timestamp: now - 10 * day },
        { personId: "person5", duration: 42, timestamp: now - 10 * day },
      ],
      notes: "Omer joined the crew!",
    },
    // Week 2 - Day 1
    {
      id: "w4",
      date: now - 7 * day,
      participants: ["person1", "person2", "person3", "person4", "person5"],
      records: [
        { personId: "person1", duration: 55, timestamp: now - 7 * day },
        { personId: "person2", duration: 48, timestamp: now - 7 * day },
        { personId: "person3", duration: 62, timestamp: now - 7 * day },
        { personId: "person4", duration: 41, timestamp: now - 7 * day },
        { personId: "person5", duration: 45, timestamp: now - 7 * day },
      ],
      notes: "Full team workout! 🔥",
    },
    // Week 2 - Day 3
    {
      id: "w5",
      date: now - 5 * day,
      participants: ["person2", "person3", "person4"],
      records: [
        { personId: "person2", duration: 52, timestamp: now - 5 * day },
        { personId: "person3", duration: 65, timestamp: now - 5 * day },
        { personId: "person4", duration: 44, timestamp: now - 5 * day },
        { personId: "person2", duration: 49, timestamp: now - 5 * day },
        { personId: "person3", duration: 60, timestamp: now - 5 * day },
        { personId: "person4", duration: 47, timestamp: now - 5 * day },
      ],
      notes: "Tomer improving fast!",
    },
    // Week 2 - Day 5
    {
      id: "w6",
      date: now - 3 * day,
      participants: ["person1", "person2", "person3", "person5"],
      records: [
        { personId: "person1", duration: 58, timestamp: now - 3 * day },
        { personId: "person2", duration: 55, timestamp: now - 3 * day },
        { personId: "person3", duration: 70, timestamp: now - 3 * day },
        { personId: "person5", duration: 50, timestamp: now - 3 * day },
      ],
      notes: "New personal bests!",
    },
    // Yesterday
    {
      id: "w7",
      date: now - 1 * day,
      participants: ["person1", "person2", "person3", "person4", "person5"],
      records: [
        { personId: "person1", duration: 62, timestamp: now - 1 * day },
        { personId: "person2", duration: 58, timestamp: now - 1 * day },
        { personId: "person3", duration: 75, timestamp: now - 1 * day },
        { personId: "person4", duration: 52, timestamp: now - 1 * day },
        { personId: "person5", duration: 55, timestamp: now - 1 * day },
        { personId: "person1", duration: 55, timestamp: now - 1 * day },
        { personId: "person2", duration: 51, timestamp: now - 1 * day },
        { personId: "person3", duration: 68, timestamp: now - 1 * day },
        { personId: "person4", duration: 48, timestamp: now - 1 * day },
        { personId: "person5", duration: 52, timestamp: now - 1 * day },
      ],
      notes: "Great session, everyone improving!",
    },
  ];
};

// Default state for SSR
const DEFAULT_STATE: AppState = {
  people: [],
  workouts: [],
  slackWebhook: "",
  dailyReminderEnabled: false,
  reminderTime: "12:30",
  lastReminderSent: "",
};

export default function Home() {
  // App state
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  // UI state
  const [activeTab, setActiveTab] = useState<"workout" | "group" | "analytics" | "settings">("workout");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [currentWorkoutRecords, setCurrentWorkoutRecords] = useState<HangRecord[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonSlack, setNewPersonSlack] = useState("");
  const [selectedPersonForAnalytics, setSelectedPersonForAnalytics] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [slackMessage, setSlackMessage] = useState("");
  
  // Timer mode state
  const [timerMode, setTimerMode] = useState<"stopwatch" | "timer">("stopwatch");
  const [targetDuration, setTargetDuration] = useState(60); // seconds for timer mode
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [elapsedInTimerMode, setElapsedInTimerMode] = useState(0); // track actual time in timer mode

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hangtrack-data");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all fields have defaults
      setState({
        people: parsed.people || [],
        workouts: parsed.workouts || [],
        slackWebhook: parsed.slackWebhook || "",
        dailyReminderEnabled: parsed.dailyReminderEnabled ?? false,
        reminderTime: parsed.reminderTime || "12:30",
        lastReminderSent: parsed.lastReminderSent || "",
      });
    } else {
      // No saved data - load mock data for demo
      setState({
        people: MOCK_PEOPLE,
        workouts: generateMockWorkouts(),
        slackWebhook: "",
        dailyReminderEnabled: false,
        reminderTime: "12:30",
        lastReminderSent: "",
      });
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("hangtrack-data", JSON.stringify(state));
  }, [state]);

  // Countdown preparation logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCountingDown && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdownSeconds === 0) {
      // Countdown finished, start the actual timer
      setIsCountingDown(false);
      setIsTimerRunning(true);
      setCountdownSeconds(5); // Reset for next time
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountingDown, countdownSeconds]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === "stopwatch") {
          setTimerSeconds((prev) => prev + 1);
        } else {
          // Timer mode - countdown
          setElapsedInTimerMode((prev) => prev + 1);
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              // Timer reached zero
              setIsTimerRunning(false);
              showNotification("success", "Time's up! 🎉");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode]);

  // Ref to store the latest state for async operations
  const stateRef = useRef(state);
  stateRef.current = state;

  // Send group reminder to Slack
  const sendGroupReminder = async (silent: boolean = false) => {
    const currentState = stateRef.current;
    if (!currentState.slackWebhook) {
      if (!silent) showNotification("error", "Please configure Slack webhook in settings");
      return false;
    }

    if (currentState.people.length === 0) {
      if (!silent) showNotification("error", "No people in the group to remind");
      return false;
    }

    const peopleList = currentState.people.map((p) => `• ${p.name}${p.slackId ? ` (<@${p.slackId.replace('@', '')}>)` : ''}`).join('\n');
    
    const message = `🔔 *HangTrack Daily Reminder*\n\n` +
      `Hey team! It's time for your daily pull bar hang workout! 💪\n\n` +
      `*Group Members:*\n${peopleList}\n\n` +
      `Head to the pull bar and let's get those hangs in! 🏋️\n` +
      `_Sent from HangTrack at ${new Date().toLocaleTimeString()}_`;

    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: currentState.slackWebhook, message }),
      });

      if (response.ok) {
        if (!silent) showNotification("success", "Reminder sent to Slack!");
        return true;
      } else {
        if (!silent) showNotification("error", "Failed to send reminder");
        return false;
      }
    } catch {
      if (!silent) showNotification("error", "Failed to send reminder. Check webhook URL.");
      return false;
    }
  };

  // Daily reminder scheduler
  useEffect(() => {
    if (!state.dailyReminderEnabled || !state.slackWebhook || state.people.length === 0) {
      return;
    }

    const checkAndSendReminder = async () => {
      const currentState = stateRef.current;
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      // Check if it's time to send reminder and haven't sent today
      if (currentTime === currentState.reminderTime && currentState.lastReminderSent !== today) {
        const sent = await sendGroupReminder(true);
        if (sent) {
          setState((prev) => ({ ...prev, lastReminderSent: today }));
          showNotification("success", "Daily reminder sent to Slack!");
        }
      }
    };

    // Check immediately and then every minute
    checkAndSendReminder();
    const interval = setInterval(checkAndSendReminder, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.dailyReminderEnabled, state.reminderTime, state.slackWebhook, state.people.length, state.lastReminderSent]);

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add person to group
  const addPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: generateId(),
      name: newPersonName.trim(),
      slackId: newPersonSlack.trim(),
      color: COLORS[state.people.length % COLORS.length],
    };
    setState((prev) => ({ ...prev, people: [...prev.people, newPerson] }));
    setNewPersonName("");
    setNewPersonSlack("");
    setShowAddPerson(false);
    showNotification("success", `${newPerson.name} added to the group!`);
  };

  // Remove person from group
  const removePerson = (id: string) => {
    setState((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p.id !== id),
    }));
  };

  // Toggle participant selection
  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Start timer (with countdown preparation)
  const startTimer = () => {
    if (selectedParticipants.length === 0) {
      showNotification("error", "Please select at least one participant");
      return;
    }
    // Start the 5-second countdown
    setCountdownSeconds(5);
    setIsCountingDown(true);
    
    // Set up timer based on mode
    if (timerMode === "timer") {
      setTimerSeconds(targetDuration);
      setElapsedInTimerMode(0);
    } else {
      setTimerSeconds(0);
    }
  };

  // Pause timer
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  // Cancel countdown
  const cancelCountdown = () => {
    setIsCountingDown(false);
    setCountdownSeconds(5);
  };

  // Record hang for current person
  const recordHang = () => {
    // In timer mode, use elapsed time; in stopwatch mode, use timerSeconds
    const recordedTime = timerMode === "timer" ? elapsedInTimerMode : timerSeconds;
    
    if (recordedTime === 0) return;
    
    const currentPersonId = selectedParticipants[currentPersonIndex];
    const record: HangRecord = {
      personId: currentPersonId,
      duration: recordedTime,
      timestamp: Date.now(),
    };
    
    setCurrentWorkoutRecords((prev) => [...prev, record]);
    setTimerSeconds(0);
    setElapsedInTimerMode(0);
    setIsTimerRunning(false);
    
    // Move to next person
    if (currentPersonIndex < selectedParticipants.length - 1) {
      setCurrentPersonIndex((prev) => prev + 1);
    }
    
    const person = state.people.find((p) => p.id === currentPersonId);
    showNotification("success", `Recorded ${formatTime(recordedTime)} for ${person?.name}`);
  };

  // Save workout
  const saveWorkout = () => {
    if (currentWorkoutRecords.length === 0) {
      showNotification("error", "No records to save");
      return;
    }
    
    const workout: Workout = {
      id: generateId(),
      date: Date.now(),
      participants: selectedParticipants,
      records: currentWorkoutRecords,
      notes: workoutNotes,
    };
    
    setState((prev) => ({ ...prev, workouts: [...prev.workouts, workout] }));
    
    // Reset workout state
    setCurrentWorkoutRecords([]);
    setSelectedParticipants([]);
    setCurrentPersonIndex(0);
    setWorkoutNotes("");
    setTimerSeconds(0);
    
    showNotification("success", "Workout saved successfully!");
  };

  // Delete workout
  const deleteWorkout = (id: string) => {
    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
    showNotification("success", "Workout deleted");
  };

  // Get person stats
  const getPersonStats = (personId: string) => {
    const records = state.workouts.flatMap((w) =>
      w.records.filter((r) => r.personId === personId)
    );
    
    if (records.length === 0) {
      return { totalHangs: 0, bestTime: 0, avgTime: 0, totalTime: 0 };
    }
    
    const durations = records.map((r) => r.duration);
    return {
      totalHangs: records.length,
      bestTime: Math.max(...durations),
      avgTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      totalTime: durations.reduce((a, b) => a + b, 0),
    };
  };

  // Send Slack notification
  const sendSlackNotification = async (personId: string) => {
    const person = state.people.find((p) => p.id === personId);
    if (!person) return;
    
    const stats = getPersonStats(personId);
    const defaultMessage = `🏋️ *HangTrack Results for ${person.name}*\n\n` +
      `📊 *Stats Summary*\n` +
      `• Total Hangs: ${stats.totalHangs}\n` +
      `• Best Time: ${formatTime(stats.bestTime)}\n` +
      `• Average Time: ${formatTime(stats.avgTime)}\n` +
      `• Total Time: ${formatTime(stats.totalTime)}\n\n` +
      `Keep up the great work! 💪`;
    
    setSlackMessage(defaultMessage);
    setShowSlackModal(true);
  };

  const confirmSendSlack = async () => {
    if (!state.slackWebhook) {
      showNotification("error", "Please configure Slack webhook in settings");
      setShowSlackModal(false);
      return;
    }

    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: state.slackWebhook, message: slackMessage }),
      });
      
      if (response.ok) {
        showNotification("success", "Message sent to Slack!");
      } else {
        showNotification("error", "Failed to send message");
      }
    } catch {
      showNotification("error", "Failed to send message. Check webhook URL.");
    }
    
    setShowSlackModal(false);
  };

  // Get current person
  const currentPerson = selectedParticipants.length > 0
    ? state.people.find((p) => p.id === selectedParticipants[currentPersonIndex])
    : null;

  // Get overall stats
  const overallStats = {
    totalWorkouts: state.workouts.length,
    totalParticipants: state.people.length,
    totalHangs: state.workouts.reduce((acc, w) => acc + w.records.length, 0),
    totalTime: state.workouts.reduce(
      (acc, w) => acc + w.records.reduce((a, r) => a + r.duration, 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-grid-pattern relative">
      {/* Background glow */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-in ${
            notification.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/20 border border-red-500/30 text-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {notification.message}
        </div>
      )}

      {/* Slack Modal */}
      {showSlackModal && (
        <div className="modal-overlay" onClick={() => setShowSlackModal(false)}>
          <div
            className="glass-card p-6 w-full max-w-lg mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Send to Slack</h3>
              <button
                onClick={() => setShowSlackModal(false)}
                className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={slackMessage}
              onChange={(e) => setSlackMessage(e.target.value)}
              className="input-field h-48 resize-none font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowSlackModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmSendSlack} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Send size={18} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center">
              <Dumbbell size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              Hang<span className="gradient-text">Track</span>
            </h1>
          </div>
          <p className="text-[var(--foreground-muted)]">
            Track your pull bar hang workouts with precision
          </p>
        </header>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card p-4 text-center">
            <div className="stat-value text-[var(--accent-light)]">{overallStats.totalWorkouts}</div>
            <div className="stat-label">Workouts</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="stat-value text-emerald-400">{overallStats.totalParticipants}</div>
            <div className="stat-label">Athletes</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="stat-value text-amber-400">{overallStats.totalHangs}</div>
            <div className="stat-label">Total Hangs</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="stat-value text-cyan-400">{formatTime(overallStats.totalTime)}</div>
            <div className="stat-label">Time Logged</div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-2 mb-8 p-1.5 glass-card rounded-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {[
            { id: "workout", icon: Timer, label: "Workout" },
            { id: "group", icon: Users, label: "Group" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/50"
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <main className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {/* WORKOUT TAB */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              {/* Timer section */}
              <div className="glass-card p-8 text-center">
                {/* Mode toggle */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    onClick={() => setTimerMode("stopwatch")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timerMode === "stopwatch"
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--border)]"
                    }`}
                  >
                    Stopwatch
                  </button>
                  <button
                    onClick={() => setTimerMode("timer")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timerMode === "timer"
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--border)]"
                    }`}
                  >
                    Timer
                  </button>
                </div>

                {/* Target duration for timer mode */}
                {timerMode === "timer" && !isTimerRunning && !isCountingDown && (
                  <div className="mb-6 animate-fade-in">
                    <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                      Set Duration
                    </label>
                    <div className="flex items-center justify-center gap-3">
                      {[30, 45, 60, 90, 120].map((secs) => (
                        <button
                          key={secs}
                          onClick={() => setTargetDuration(secs)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            targetDuration === secs
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--border)]"
                          }`}
                        >
                          {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="5"
                        max="600"
                        value={targetDuration}
                        onChange={(e) => setTargetDuration(Math.max(5, Math.min(600, parseInt(e.target.value) || 60)))}
                        className="w-20 input-field text-center"
                      />
                      <span className="text-[var(--foreground-muted)]">sec</span>
                    </div>
                  </div>
                )}

                {/* Countdown preparation display */}
                {isCountingDown && (
                  <div className="mb-6 animate-scale-in">
                    <div className="text-[var(--foreground-muted)] mb-2">Get Ready!</div>
                    <div className="text-8xl font-bold text-[var(--accent)] pulse-glow">
                      {countdownSeconds}
                    </div>
                    <button
                      onClick={cancelCountdown}
                      className="mt-4 btn-secondary"
                    >
                      Cancel
                    </button>
        </div>
                )}

                {/* Main timer display */}
                {!isCountingDown && (
                  <div className="mb-6">
                    <div
                      className={`timer-display ${isTimerRunning ? "gradient-text pulse-glow" : "text-[var(--foreground)]"}`}
                    >
                      {formatTime(timerSeconds)}
                    </div>
                    
                    {/* Show elapsed time in timer mode */}
                    {timerMode === "timer" && isTimerRunning && (
                      <div className="text-sm text-[var(--foreground-muted)] mt-2">
                        Elapsed: {formatTime(elapsedInTimerMode)}
                      </div>
                    )}
                    
                    {currentPerson && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: currentPerson.color }}
                        />
                        <span className="text-lg font-medium">{currentPerson.name}</span>
                        <span className="text-[var(--foreground-muted)]">
                          ({currentPersonIndex + 1}/{selectedParticipants.length})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Timer controls */}
                {!isCountingDown && (
                  <div className="flex items-center justify-center gap-4">
                    {!isTimerRunning ? (
                      <button
                        onClick={startTimer}
                        className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                      >
                        <Play size={24} />
                        Start
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
                      >
                        <Pause size={24} />
                        Pause
                      </button>
                    )}
                    <button
                      onClick={recordHang}
                      disabled={timerMode === "stopwatch" ? timerSeconds === 0 : elapsedInTimerMode === 0}
                      className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                    >
                      <Square size={24} />
                      Record
                    </button>
                  </div>
                )}
              </div>

              {/* Participant selection */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users size={20} className="text-[var(--accent-light)]" />
                  Select Participants
                </h3>
                {state.people.length === 0 ? (
                  <p className="text-[var(--foreground-muted)] text-center py-8">
                    No people in your group yet.{" "}
                    <button
                      onClick={() => setActiveTab("group")}
                      className="text-[var(--accent-light)] hover:underline"
                    >
                      Add someone first
                    </button>
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {state.people.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => toggleParticipant(person.id)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          selectedParticipants.includes(person.id)
                            ? "border-[var(--accent)] bg-[var(--accent)]/10"
                            : "border-[var(--border)] hover:border-[var(--foreground-muted)]"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: person.color }}
                        >
                          {person.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium truncate">{person.name}</span>
                        {selectedParticipants.includes(person.id) && (
                          <Check size={18} className="text-[var(--accent-light)] ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Current workout records */}
              {currentWorkoutRecords.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-[var(--accent-light)]" />
                    Current Session Records
                  </h3>
                  <div className="space-y-2">
                    {currentWorkoutRecords.map((record, idx) => {
                      const person = state.people.find((p) => p.id === record.personId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: person?.color }}
                            >
                              {person?.name[0].toUpperCase()}
                            </div>
                            <span>{person?.name}</span>
                          </div>
                          <span className="font-mono text-lg font-semibold text-[var(--accent-light)]">
                            {formatTime(record.duration)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Notes */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Add notes for this workout..."
                      value={workoutNotes}
                      onChange={(e) => setWorkoutNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <button
                    onClick={saveWorkout}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Save Workout
                  </button>
                </div>
              )}

              {/* Recent workouts */}
              {state.workouts.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-[var(--accent-light)]" />
                    Recent Workouts
                  </h3>
                  <div className="space-y-3">
                    {state.workouts
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((workout) => (
                        <div
                          key={workout.id}
                          className="p-4 bg-[var(--background-secondary)] rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[var(--foreground-muted)]">
                              {formatDate(workout.date)}
                            </span>
                            <button
                              onClick={() => deleteWorkout(workout.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {workout.participants.map((pId) => {
                              const person = state.people.find((p) => p.id === pId);
                              return person ? (
                                <span
                                  key={pId}
                                  className="badge"
                                  style={{
                                    backgroundColor: `${person.color}20`,
                                    color: person.color,
                                  }}
                                >
                                  {person.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                          <div className="text-sm text-[var(--foreground-muted)]">
                            {workout.records.length} records • Total:{" "}
                            {formatTime(workout.records.reduce((a, r) => a + r.duration, 0))}
                          </div>
                          {workout.notes && (
                            <div className="mt-2 text-sm italic text-[var(--foreground-muted)]">
                              &quot;{workout.notes}&quot;
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GROUP TAB */}
          {activeTab === "group" && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Users size={24} className="text-[var(--accent-light)]" />
                    Your Training Group
                  </h3>
                  <button
                    onClick={() => setShowAddPerson(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    Add Person
                  </button>
                </div>

                {state.people.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-[var(--foreground-muted)] mb-4" />
                    <p className="text-[var(--foreground-muted)]">
                      Your group is empty. Add people to start tracking!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {state.people.map((person, idx) => {
                      const stats = getPersonStats(person.id);
                      return (
                        <div
                          key={person.id}
                          className="p-4 bg-[var(--background-secondary)] rounded-xl flex items-center gap-4 animate-slide-in"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                            style={{ backgroundColor: person.color }}
                          >
                            {person.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg">{person.name}</div>
                            {person.slackId && (
                              <div className="text-sm text-[var(--foreground-muted)]">
                                Slack: {person.slackId}
                              </div>
                            )}
                            <div className="flex gap-4 mt-1 text-sm text-[var(--foreground-muted)]">
                              <span>{stats.totalHangs} hangs</span>
                              <span>Best: {formatTime(stats.bestTime)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendSlackNotification(person.id)}
                              className="p-3 hover:bg-[var(--border)] rounded-xl transition-colors"
                              title="Send stats to Slack"
                            >
                              <Send size={18} className="text-[var(--accent-light)]" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPersonForAnalytics(person.id);
                                setActiveTab("analytics");
                              }}
                              className="p-3 hover:bg-[var(--border)] rounded-xl transition-colors"
                              title="View analytics"
                            >
                              <BarChart3 size={18} className="text-emerald-400" />
                            </button>
                            <button
                              onClick={() => removePerson(person.id)}
                              className="p-3 hover:bg-red-500/20 rounded-xl transition-colors"
                              title="Remove person"
                            >
                              <Trash2 size={18} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add person modal */}
              {showAddPerson && (
                <div className="modal-overlay" onClick={() => setShowAddPerson(false)}>
                  <div
                    className="glass-card p-6 w-full max-w-md mx-4 animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Add New Person</h3>
                      <button
                        onClick={() => setShowAddPerson(false)}
                        className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          placeholder="Enter name"
                          className="input-field"
                          autoFocus
                        />
    </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">
                          Slack Username (optional)
                        </label>
                        <input
                          type="text"
                          value={newPersonSlack}
                          onChange={(e) => setNewPersonSlack(e.target.value)}
                          placeholder="@username"
                          className="input-field"
                        />
                      </div>
                      <button
                        onClick={addPerson}
                        disabled={!newPersonName.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add to Group
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Person selector for detailed analytics */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={24} className="text-[var(--accent-light)]" />
                  Individual Analytics
                </h3>
                
                {state.people.length === 0 ? (
                  <p className="text-[var(--foreground-muted)] text-center py-8">
                    Add people to your group to see analytics.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {state.people.map((person) => (
                        <button
                          key={person.id}
                          onClick={() => setSelectedPersonForAnalytics(
                            selectedPersonForAnalytics === person.id ? null : person.id
                          )}
                          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                            selectedPersonForAnalytics === person.id
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--background-secondary)] hover:bg-[var(--border)]"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: person.color }}
                          >
                            {person.name[0]}
                          </div>
                          {person.name}
                        </button>
                      ))}
                    </div>

                    {selectedPersonForAnalytics && (() => {
                      const person = state.people.find((p) => p.id === selectedPersonForAnalytics);
                      const stats = getPersonStats(selectedPersonForAnalytics);
                      const records = state.workouts.flatMap((w) =>
                        w.records.filter((r) => r.personId === selectedPersonForAnalytics)
                      );
                      
                      return (
                        <div className="space-y-4 animate-fade-in">
                          {/* Person header */}
                          <div className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                              style={{ backgroundColor: person?.color }}
                            >
                              {person?.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{person?.name}</div>
                              <div className="text-[var(--foreground-muted)]">
                                {stats.totalHangs} total hangs recorded
                              </div>
                            </div>
                            <button
                              onClick={() => sendSlackNotification(selectedPersonForAnalytics)}
                              className="ml-auto btn-secondary flex items-center gap-2"
                            >
                              <Send size={18} />
                              Send to Slack
                            </button>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                              <Award className="mx-auto mb-2 text-amber-400" size={24} />
                              <div className="stat-value text-amber-400">{formatTime(stats.bestTime)}</div>
                              <div className="stat-label">Personal Best</div>
                            </div>
                            <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                              <TrendingUp className="mx-auto mb-2 text-emerald-400" size={24} />
                              <div className="stat-value text-emerald-400">{formatTime(stats.avgTime)}</div>
                              <div className="stat-label">Average</div>
                            </div>
                            <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                              <Clock className="mx-auto mb-2 text-cyan-400" size={24} />
                              <div className="stat-value text-cyan-400">{formatTime(stats.totalTime)}</div>
                              <div className="stat-label">Total Time</div>
                            </div>
                            <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                              <Timer className="mx-auto mb-2 text-[var(--accent-light)]" size={24} />
                              <div className="stat-value text-[var(--accent-light)]">{stats.totalHangs}</div>
                              <div className="stat-label">Total Hangs</div>
                            </div>
                          </div>

                          {/* Recent records */}
                          {records.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Recent Records</h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {records
                                  .slice()
                                  .reverse()
                                  .slice(0, 20)
                                  .map((record, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg"
                                    >
                                      <span className="text-sm text-[var(--foreground-muted)]">
                                        {formatDate(record.timestamp)}
                                      </span>
                                      <span className="font-mono font-semibold text-[var(--accent-light)]">
                                        {formatTime(record.duration)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Progress visualization */}
                          {records.length >= 2 && (
                            <div>
                              <h4 className="font-semibold mb-3">Progress Chart</h4>
                              <div className="p-4 bg-[var(--background-secondary)] rounded-xl">
                                <div className="flex items-end gap-1 h-32">
                                  {records.slice(-20).map((record, idx) => {
                                    const maxDuration = Math.max(...records.map((r) => r.duration));
                                    const height = (record.duration / maxDuration) * 100;
                                    return (
                                      <div
                                        key={idx}
                                        className="flex-1 rounded-t transition-all hover:opacity-80"
                                        style={{
                                          height: `${height}%`,
                                          backgroundColor: person?.color,
                                          minWidth: "8px",
                                        }}
                                        title={formatTime(record.duration)}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="text-xs text-[var(--foreground-muted)] text-center mt-2">
                                  Last {Math.min(records.length, 20)} hangs
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {!selectedPersonForAnalytics && (
                      <div className="text-center py-8 text-[var(--foreground-muted)]">
                        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Select a person above to view their detailed analytics</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Leaderboard */}
              {state.people.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award size={24} className="text-amber-400" />
                    Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {state.people
                      .map((person) => ({
                        person,
                        stats: getPersonStats(person.id),
                      }))
                      .sort((a, b) => b.stats.bestTime - a.stats.bestTime)
                      .map(({ person, stats }, idx) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0
                                ? "bg-amber-500 text-black"
                                : idx === 1
                                ? "bg-gray-300 text-black"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-[var(--border)] text-[var(--foreground-muted)]"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: person.color }}
                          >
                            {person.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{person.name}</div>
                            <div className="text-sm text-[var(--foreground-muted)]">
                              {stats.totalHangs} hangs
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-lg font-semibold text-[var(--accent-light)]">
                              {formatTime(stats.bestTime)}
                            </div>
                            <div className="text-xs text-[var(--foreground-muted)]">Best time</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Settings size={24} className="text-[var(--accent-light)]" />
                  Settings
                </h3>

                {/* Slack webhook */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">
                    Slack Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={state.slackWebhook}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, slackWebhook: e.target.value }))
                      }
                      placeholder="https://hooks.slack.com/services/..."
                      className="input-field flex-1"
                    />
                    <button
                      onClick={async () => {
                        if (!state.slackWebhook) {
                          showNotification("error", "Please enter a webhook URL first");
                          return;
                        }
                        try {
                          const response = await fetch("/api/slack", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              webhookUrl: state.slackWebhook,
                              message: "✅ *HangTrack Test Message*\n\nYour Slack webhook is configured correctly! 🎉\n\n_This is a test message from HangTrack._"
                            }),
                          });
                          if (response.ok) {
                            showNotification("success", "Test message sent! Check your Slack channel.");
                          } else {
                            showNotification("error", "Failed to send. Check your webhook URL.");
                          }
                        } catch {
                          showNotification("error", "Connection failed. Check your webhook URL.");
                        }
                      }}
                      disabled={!state.slackWebhook}
                      className="btn-secondary whitespace-nowrap flex items-center gap-2"
                    >
                      <Send size={16} />
                      Test
                    </button>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] mt-2">
                    Configure an incoming webhook in your Slack workspace to send results.
                  </p>
                </div>

                {/* Daily Reminder */}
                <div className="mb-6 pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {state.dailyReminderEnabled ? (
                        <Bell size={20} className="text-[var(--accent-light)]" />
                      ) : (
                        <BellOff size={20} className="text-[var(--foreground-muted)]" />
                      )}
                      <div>
                        <h4 className="font-semibold">Daily Reminder</h4>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Send a Slack reminder to all group members
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          dailyReminderEnabled: !prev.dailyReminderEnabled,
                        }))
                      }
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        state.dailyReminderEnabled
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--border)]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                          state.dailyReminderEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {state.dailyReminderEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-muted)]">
                          Reminder Time
                        </label>
                        <input
                          type="time"
                          value={state.reminderTime}
                          onChange={(e) =>
                            setState((prev) => ({ ...prev, reminderTime: e.target.value }))
                          }
                          className="input-field w-40"
                        />
                        <p className="text-xs text-[var(--foreground-muted)] mt-2">
                          The reminder will be sent daily at this time (when the app is open)
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => sendGroupReminder(false)}
                          disabled={!state.slackWebhook || state.people.length === 0}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Send size={16} />
                          Send Reminder Now
                        </button>
                        <button
                          onClick={() => {
                            const peopleList = state.people.length > 0 
                              ? state.people.map((p) => `• ${p.name}${p.slackId ? ` (<@${p.slackId.replace('@', '')}>)` : ''}`).join('\n')
                              : '• (No people in group yet)';
                            
                            const previewMessage = `🔔 *HangTrack Daily Reminder*\n\n` +
                              `Hey team! It's time for your daily pull bar hang workout! 💪\n\n` +
                              `*Group Members:*\n${peopleList}\n\n` +
                              `Head to the pull bar and let's get those hangs in! 🏋️\n` +
                              `_Sent from HangTrack at ${new Date().toLocaleTimeString()}_`;
                            
                            setSlackMessage(previewMessage);
                            setShowSlackModal(true);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <AlertCircle size={16} />
                          Preview Message
                        </button>
                        {state.lastReminderSent && (
                          <span className="text-xs text-[var(--foreground-muted)]">
                            Last sent: {state.lastReminderSent}
                          </span>
                        )}
                      </div>

                      {!state.slackWebhook && (
                        <p className="text-xs text-amber-400">
                          ⚠️ Please configure Slack webhook above to enable reminders
                        </p>
                      )}
                      {state.people.length === 0 && (
                        <p className="text-xs text-amber-400">
                          ⚠️ Add people to your group to send reminders
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Data management */}
                <div className="pt-6 border-t border-[var(--border)]">
                  <h4 className="font-semibold mb-4">Data Management</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const data = JSON.stringify(state, null, 2);
                        const blob = new Blob([data], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "hangtrack-backup.json";
                        a.click();
                        showNotification("success", "Data exported successfully");
                      }}
                      className="btn-secondary"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Load demo data with 3 people and sample workouts?")) {
                          setState((prev) => ({ 
                            ...prev,
                            people: MOCK_PEOPLE,
                            workouts: generateMockWorkouts(),
                          }));
                          showNotification("success", "Demo data loaded!");
                        }
                      }}
                      className="btn-secondary text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/20"
                    >
                      Load Demo Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                          setState({ 
                            people: [], 
                            workouts: [], 
                            slackWebhook: "",
                            dailyReminderEnabled: false,
                            reminderTime: "12:30",
                            lastReminderSent: "",
                          });
                          showNotification("success", "All data cleared");
                        }
                      }}
                      className="btn-secondary text-red-400 border-red-400/30 hover:bg-red-500/20"
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4">About HangTrack</h3>
                <p className="text-[var(--foreground-muted)] mb-4">
                  HangTrack is a precision training tool for tracking pull bar hang workouts.
                  Track individual progress, compete with your training group, and share results via Slack.
                </p>
                <div className="text-sm text-[var(--foreground-muted)]">
                  Built with Next.js 14 • Tailwind CSS • Lucide Icons
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
