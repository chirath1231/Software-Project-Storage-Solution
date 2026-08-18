// Mock data for CEYNOA cloud storage app.

export const storage = {
  used: 70, // GB
  total: 100, // GB
  get percent() {
    return Math.round((this.used / this.total) * 100);
  },
};

export const folders = [
  { id: "f1", name: "Folder 01", files: 12, size: "2.4 GB", color: "#FF8A00" },
  { id: "f2", name: "Folder 02", files: 8, size: "1.1 GB", color: "#3b82f6" },
  { id: "f3", name: "Folder 03", files: 24, size: "5.6 GB", color: "#10b981" },
  { id: "f4", name: "Folder 04", files: 3, size: "320 MB", color: "#8b5cf6" },
];

export const files = [
  { id: "d1", name: "Proposal.pdf", kind: "pdf", size: "2.4 MB", modified: "Today", shared: true },
  { id: "d2", name: "Brand-Guide.pdf", kind: "pdf", size: "8.1 MB", modified: "Yesterday", shared: false },
  { id: "d3", name: "Q3-Report.docx", kind: "doc", size: "1.2 MB", modified: "2 days ago", shared: true },
  { id: "d4", name: "Cover.png", kind: "image", size: "640 KB", modified: "Last week", shared: false },
  { id: "d5", name: "Demo.mp4", kind: "video", size: "54 MB", modified: "Last week", shared: false },
];

export const recentFiles = files.slice(0, 3);

export const sharedFiles = files.filter((f) => f.shared);

export const clients = [
  { id: "c1", name: "Zachary Erza", note: "Lorem ipsum dolor sit amet", avatar: "https://i.pravatar.cc/120?img=12", unread: 1, online: true },
  { id: "c2", name: "Katrina Hawkins", note: "Shared the brand assets", avatar: "https://i.pravatar.cc/120?img=32", unread: 3, online: false },
  { id: "c3", name: "Mirabel", note: "Lorem ipsum dolor sit amet", avatar: "https://i.pravatar.cc/120?img=45", unread: 0, online: true },
  { id: "c4", name: "Dorian", note: "Reviewing the proposal", avatar: "https://i.pravatar.cc/120?img=15", unread: 0, online: false },
  { id: "c5", name: "Hamnet Piercer", note: "Lorem ipsum dolor sit amet", avatar: "https://i.pravatar.cc/120?img=8", unread: 0, online: false },
  { id: "c6", name: "Imogen", note: "Online now", avatar: "https://i.pravatar.cc/120?img=49", unread: 0, online: true },
];

export const notifications = [
  {
    id: "n1",
    type: "feature",
    title: "Update: New Features Added to Your Account!",
    body: "Exciting news! We've rolled out new features to improve your experience.",
    time: "Just now",
    unread: true,
  },
  {
    id: "n2",
    type: "tip",
    title: "Friendly Tip: Optimize Your Workspace",
    body: "Just a heads up that your next payment renews in 3 days.",
    time: "7 hours ago",
    unread: true,
  },
  {
    id: "n3",
    type: "system",
    title: "System Notification: Security Check Scheduled",
    body: "For your safety, a system security check is scheduled for tonight.",
    time: "Yesterday",
    unread: false,
  },
];

export const plans = [
  {
    id: "standard",
    name: "Standard",
    price: 2,
    storage: "10 GB",
    features: ["Monthly individual backup", "Basic email & chat support", "2-day link expiry"],
    highlight: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: 10,
    storage: "100 GB",
    features: ["Priority upload speeds", "Extended 30-day link expiry", "Up to 5 collaborators"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 30,
    storage: "1 TB",
    features: ["Best for businesses", "Unlimited file sharing", "Dedicated 24/7 support"],
    highlight: false,
  },
];

export const faqs = [
  { q: "How do I upload files?", a: "Tap the center upload button on the bottom bar, choose a file, pick a destination folder, and tap Upload." },
  { q: "How do I upgrade my plan?", a: "Go to Profile → Subscription Plan and select the plan that fits your needs." },
  { q: "How do I share my files?", a: "Open any file, tap Share, choose recipients and set an optional expiry date." },
  { q: "Why has my share link expired?", a: "Share links expire based on your plan. Upgrade for longer expiry windows." },
];

// Chat thread for the Clients → Chat screen
export const chatMessages = [
  { id: "m1", fromMe: false, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.", time: "2:01 PM" },
  { id: "m2", fromMe: false, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", time: "2:01 PM" },
  { id: "m3", fromMe: true, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.", time: "2:02 PM" },
];

export const fileKindMeta = {
  pdf: { icon: "document-text", color: "#ef4444" },
  doc: { icon: "document-text", color: "#3b82f6" },
  image: { icon: "image", color: "#10b981" },
  video: { icon: "videocam", color: "#8b5cf6" },
  default: { icon: "document", color: "#FF8A00" },
};
