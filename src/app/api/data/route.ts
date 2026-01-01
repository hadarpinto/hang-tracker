import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const DATA_KEY = "hangtrack-shared-data";

// Default mock data
const MOCK_PEOPLE = [
  { id: "person1", name: "Hadar Pinto", slackId: "@hadarp", color: "#7c3aed" },
  { id: "person2", name: "Yehonatan Zaritsky", slackId: "@yehonatanz", color: "#ec4899" },
  { id: "person3", name: "Roni Lippin", slackId: "@ronili", color: "#06b6d4" },
  { id: "person4", name: "Tomer Shkolnik", slackId: "@tomer", color: "#10b981" },
  { id: "person5", name: "Omer Burshtein", slackId: "@omerb", color: "#f59e0b" },
];

const generateMockWorkouts = () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  return [
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
    {
      id: "w2",
      date: now - 12 * day,
      participants: ["person1", "person2", "person4"],
      records: [
        { personId: "person1", duration: 48, timestamp: now - 12 * day },
        { personId: "person2", duration: 42, timestamp: now - 12 * day },
        { personId: "person4", duration: 35, timestamp: now - 12 * day },
      ],
      notes: "Tomer's first session!",
    },
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
      ],
      notes: "Great session, everyone improving!",
    },
  ];
};

const getDefaultData = () => ({
  people: MOCK_PEOPLE,
  workouts: generateMockWorkouts(),
  slackWebhook: "",
  dailyReminderEnabled: false,
  reminderTime: "12:30",
  lastReminderSent: "",
});

// GET - Fetch shared data
export async function GET() {
  try {
    const data = await kv.get(DATA_KEY);
    
    if (!data) {
      // Initialize with default data if none exists
      const defaultData = getDefaultData();
      await kv.set(DATA_KEY, defaultData);
      return NextResponse.json(defaultData);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return default data if KV is not configured
    return NextResponse.json(getDefaultData());
  }
}

// POST - Save shared data
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await kv.set(DATA_KEY, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}

// DELETE - Reset to default data
export async function DELETE() {
  try {
    const defaultData = getDefaultData();
    await kv.set(DATA_KEY, defaultData);
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}

